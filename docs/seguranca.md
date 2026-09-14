# Modelo de segurança do Zuzuhop

App infantil tem uma superfície de risco diferente de um SaaS comum: o
usuário final não sabe ler, não avalia risco e não pode consentir. Por isso a
segurança aqui foi tratada como requisito de produto desde o primeiro commit,
não como camada aplicada depois.

---

## 1. Três realms, três níveis de confiança

| Realm | Quem é | Autenticação | Cookie | Validade |
|---|---|---|---|---|
| **Família** | adulto responsável | e-mail + senha | `zh_family` | 30 dias |
| **Criança** | perfil dentro da sessão da família | nenhuma — herda a sessão do adulto | (o mesmo) | igual |
| **Administração** | equipe Zuzuhop | e-mail + senha + TOTP | `zh_admin` | 8 horas |

Os realms são **fisicamente separados**: tabelas diferentes (`Guardian` /
`AdminUser`), tabelas de sessão diferentes, cookies com nomes diferentes,
limites de tentativa diferentes. Vazar a senha de um responsável não dá
nenhum caminho para o painel administrativo.

A criança **nunca tem credencial**. Não há e-mail, senha, PIN ou login
infantil para vazar, ser adivinhado ou ser usado em outro serviço. O perfil
da criança só existe dentro de uma sessão de adulto já autenticada.

Verificado no teste ponta a ponta: cookie de admin em `/familia` → redireciona
para `/entrar`; cookie de família em `/admin` → redireciona para `/admin/login`.

---

## 2. Senhas

`src/lib/password.ts`

- **scrypt** com os parâmetros recomendados pelo OWASP (N=2^16, r=8, p=1),
  chave de 64 bytes, salt aleatório de 16 bytes por usuário.
- Sem dependência nativa: usa `node:crypto`, então não há risco de build
  quebrado nem de biblioteca de terceiros comprometida na cadeia.
- Comparação com `timingSafeEqual`.
- Política mínima: 10 caracteres, maiúscula, minúscula, número, e bloqueio de
  senhas comuns.

### Contra enumeração de contas
- Mensagem de erro **idêntica** para e-mail inexistente e senha errada.
- `fakeVerifyDelay()` executa um scrypt real quando a conta não existe, para
  que o tempo de resposta não denuncie a diferença.
- O cadastro com e-mail já existente não diz "esse e-mail já tem conta";
  orienta genericamente a usar a tela de entrar.

---

## 3. Sessões

`src/lib/session.ts`

- Token opaco de 32 bytes aleatórios (`randomBytes`), nunca um JWT com dados
  dentro.
- No banco guardamos **apenas o SHA-256 do token**. Um dump do banco não
  permite sequestrar sessão.
- Cookie `httpOnly`, `secure` em produção, `sameSite=lax`, com expiração
  explícita.
- Revogação real: coluna `revokedAt` consultada a cada requisição. Logout,
  suspensão de conta e troca de senha derrubam sessões **imediatamente** —
  diferente de JWT, que fica válido até expirar.
- `lastUsedAt` atualizado no máximo a cada 5 minutos (família) e 1 minuto
  (admin), para não gravar a cada request.
- O responsável vê e encerra suas sessões em `/familia/conta`.

---

## 4. Força bruta e abuso

| Alvo | Limite |
|---|---|
| Login família | 8 tentativas / 5 min, por IP **e** por conta |
| Login admin | 5 tentativas / 15 min, por IP **e** por conta |
| Cadastro | 5 / hora por IP |
| Portão parental | 10 / 5 min por conta |
| Envio de progresso | 60 / min por perfil |

Além do rate limit, há **bloqueio progressivo de conta**: 6 falhas bloqueiam
a conta da família por 15 minutos; 5 falhas bloqueiam a conta administrativa
por 30 minutos.

Toda tentativa — com sucesso ou não — vai para `LoginAttempt` com realm, IP e
motivo. A tela de auditoria mostra as últimas falhas.

> **Produção:** o rate limit é em memória (`src/lib/rate-limit.ts`), o que só
> funciona com instância única. Com múltiplas réplicas, troque o corpo de
> `hit()` por Redis (INCR + EXPIRE) — a assinatura já está isolada para isso.

---

## 5. Segundo fator no painel administrativo

`src/lib/totp.ts` — implementação própria de TOTP (RFC 6238), sem dependência
externa: HMAC-SHA1, janela de 30s, 6 dígitos, tolerância de ±1 janela.

Fluxo:
1. Primeiro login sem 2FA → é permitido, mas o destino é forçado para
   `/admin/seguranca` e uma tarja de alerta aparece em todo o painel.
2. "Configurar agora" gera o segredo e o marca como **pendente**.
3. QR code (gerado no servidor, embutido como `data:` URI) + chave manual.
4. O 2FA só passa a valer depois que um código válido é confirmado.
5. A partir daí, o login exige o código: o endpoint responde
   `{ needsTotp: true }` e o formulário pede os 6 dígitos.

Testado em `scripts/verificar-seguranca.ts`: aceita código válido, rejeita
código errado e rejeita código gerado com o segredo de outra conta.

---

## 6. Portão parental

`src/lib/parental-gate.ts`

Barreira entre o modo criança e qualquer área de adulto. Não é autenticação —
é um obstáculo cognitivo calibrado para 2 a 8 anos: um número **escrito por
extenso** que precisa ser convertido em algarismos, dentro de uma
multiplicação ("Quanto é sete vezes oito?").

O desafio é **sem estado e à prova de adulteração**: a resposta esperada
viaja assinada por HMAC-SHA256 com o `AUTH_SECRET`, junto de um prazo de 5
minutos. Um token forjado no cliente não passa; um token expirado não passa.

Testes cobrem os quatro casos: resposta certa, resposta errada, assinatura
adulterada e token expirado.

---

## 7. Limite de tempo de tela — por que no servidor

`src/lib/screen-time.ts`

O jogo envia um heartbeat a cada 30 segundos (e ao esconder a aba). O
servidor soma o tempo em `PlaySession`, agrupado por `dayKey` (YYYY-MM-DD
local), e compara com o limite do perfil.

Isso significa que **mudar o relógio do tablet, recarregar a página ou mexer
no JavaScript não estende a brincadeira**. Quando o limite estoura:

- `/kids` e `/kids/jogo/[slug]` redirecionam para `/kids/fim` antes de
  renderizar;
- a despedida é acolhedora ("Por hoje é só! Amanhã tem mais"), nunca punitiva.

Verificado no teste ponta a ponta: com limite de 15 min, após 600s restam
300s; após mais 400s o estado vira `blocked: true` e as rotas passam a
redirecionar.

---

## 8. Autorização — nunca confiar no id que veio do formulário

Toda consulta a um recurso de criança é filtrada pelo dono:

```ts
const child = await db.childProfile.findFirst({
  where: { id, guardianId: session.guardian.id },
});
```

Um id de outra família devolve 404, não 403 — não confirmamos sequer a
existência do recurso alheio.

No painel administrativo, as permissões são por papel
(`ADMIN_PERMISSIONS` em `src/lib/session.ts`):

| Papel | Permissões |
|---|---|
| `superadmin` | tudo, incluindo gerenciar administradores |
| `suporte` | ler/escrever famílias, ler conteúdo, ler auditoria |
| `conteudo` | ler/escrever conteúdo |

A checagem é feita em `requireAdmin(permission)` **dentro de cada Server
Action** — não apenas escondendo o botão na interface. O menu lateral também
filtra por permissão, mas isso é conveniência, não controle.

Regra extra: um administrador não consegue suspender a própria conta.

---

## 9. CSRF, CSP e cabeçalhos

- **CSRF:** cookies `SameSite=Lax` + verificação explícita de `Origin` /
  `Sec-Fetch-Site` em toda rota de API mutante (`isSameOrigin`). Server
  Actions já têm a checagem nativa do Next. Verificado: `Origin: evil.com`
  recebe 403.
- **CSP:** `default-src 'self'`, `frame-ancestors 'none'`, `object-src
  'none'`, `form-action 'self'`, `connect-src 'self'`. Nenhum recurso de
  terceiro carrega — nem fonte, nem script, nem analytics. Por isso os sons
  são **sintetizados em Web Audio** em vez de arquivos de CDN.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, HSTS com preload.
- `Permissions-Policy` desliga câmera, geolocalização e FLoC.
- `poweredByHeader: false`.
- `/admin/*` marcado com `robots: noindex, nofollow`.

---

## 10. Log de auditoria

`AuditLog` registra ator (tipo, id, rótulo), ação, alvo, IP, user-agent,
metadados em JSON e timestamp. É gravado por `audit()`, que **nunca lança
exceção** — falha de auditoria não derruba a operação, só loga no console.

Eventos cobertos: cadastro, login e logout (família e admin), login
administrativo falho, criação/edição/exclusão de perfil, exportação de dados,
exclusão de conta, mudança de status e plano de família, publicação e
despublicação de jogo, criação e suspensão de administrador, ativação de 2FA,
troca de senha e sucesso no portão parental.

Visível e filtrável em `/admin/auditoria`, com paginação.

---

## 11. Minimização de dados (LGPD e COPPA)

**Do responsável:** nome, e-mail, hash da senha, data/IP/versão do
consentimento, registros de acesso.

**Do perfil infantil:** apelido, ano de nascimento, avatar, cor preferida,
preferências de som, progresso.

**O que deliberadamente não existe no banco:** nome completo da criança,
foto, data de nascimento exata, escola, endereço, geolocalização, contatos,
gravação de áudio, texto livre escrito pela criança.

O campo de apelido tem validação `/^[\p{L}\p{N} '-]+$/u` — rejeita `@`, `.` e
sequências de telefone, impedindo que um responsável, sem querer, digite um
dado que não deveríamos guardar.

### Direitos do titular, na própria interface
- **Portabilidade:** `/api/familia/exportar` devolve tudo em JSON legível.
- **Eliminação:** excluir um perfil apaga progresso e sessões de brincadeira;
  excluir a conta remove tudo em cascata (`onDelete: Cascade`).
- **Revogação de consentimento:** é a própria exclusão, sem formulário e sem
  atendimento humano no caminho.

### Consentimento
Duas caixas separadas e obrigatórias no cadastro — declaração de ser
responsável legal e aceite de termos/privacidade — com data, IP e versão
(`CONSENT_VERSION`) gravados. Nenhuma caixa vem pré-marcada; a de marketing é
opcional e separada, nunca condicionante.

---

## 12. Superfície de ataque do modo criança

Dentro de `/kids` não existe: campo de texto livre, chat, comentário, link
externo, botão de compra, upload, anúncio ou qualquer chamada a domínio de
terceiro. A única saída é o portão parental.

A classe `.kid-mode` desliga seleção de texto, arrastar imagem e zoom por
gesto, para reduzir saída acidental.

---

## 13. O que falta antes de ir a produção

Itens conhecidos e conscientes — nenhum deles bloqueia o desenvolvimento:

1. **Trocar SQLite por PostgreSQL** e rodar migrations versionadas
   (`prisma migrate`) em vez de `db push`.
2. **Rate limit distribuído** (Redis), como descrito na seção 4.
3. **Verificação de e-mail** — o modelo `VerificationToken` já existe; falta
   o envio e as telas.
4. **Recuperação de senha** — mesma observação.
5. **Verificação reforçada do responsável**: para o mercado dos EUA, a COPPA
   pede método verificável (cartão com cobrança simbólica, documento). Para o
   Brasil, o padrão atual atende o "esforço razoável" da LGPD.
6. **Rotação de `AUTH_SECRET`** e gestão de segredos fora do `.env`.
7. **Retenção automática**: expurgo de `LoginAttempt` e `AuditLog` após 6
   meses (Marco Civil).
8. **Remover `'unsafe-inline'` e `'unsafe-eval'` da CSP** em produção, usando
   nonce — hoje estão lá por causa do runtime de desenvolvimento do Next.
9. **Pentest e revisão externa** antes do lançamento público.

---

## Como rodar os testes de segurança

```bash
npm run test:seguranca
```

Cobre TOTP (válido, inválido, segredo cruzado), portão parental (certo,
errado, adulterado, expirado) e hashing de senha (verificação, salt único,
política de força).
