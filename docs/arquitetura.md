# Arquitetura e stack

## A escolha da stack

**Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 +
Prisma + PostgreSQL (SQLite em desenvolvimento).**

### Por quê

| Critério | Decisão |
|---|---|
| Um time pequeno mantendo site institucional, área da família, modo criança e painel admin | Um único codebase, um deploy, um modelo de dados |
| Segurança precisa rodar no servidor | Server Components e Server Actions deixam a lógica sensível fora do bundle do cliente por padrão |
| SEO do site institucional + app interativo | SSR onde importa, cliente onde importa |
| Público em tablet, muitas vezes com internet ruim | PWA instalável, code splitting por jogo |
| Caminho para as lojas de aplicativo | O mesmo codebase empacota com Capacitor; se algum jogo exigir performance de jogo nativo, migra-se aquele jogo, não o app |

### Alternativas consideradas

- **React Native / Expo** — melhor para loja, pior para o painel
  administrativo e o site. Exigiria um segundo codebase web. Faz sentido
  depois, se a distribuição por loja virar o canal principal.
- **Flutter** — ótimo para animação, mas jogaria fora o ecossistema web e
  duplicaria o trabalho de backend.
- **Unity / Phaser** — resolve jogos complexos, mas é peso morto para
  atividades de toque simples, que é 90% do catálogo. Phaser continua sendo
  opção pontual, embarcado em um jogo específico.

### Decisões de dependência

Poucas dependências, de propósito: `next`, `react`, `@prisma/client`, `zod`,
`qrcode`. Nada mais.

- **Autenticação feita à mão**, sem NextAuth/Auth.js. Precisávamos de dois
  realms separados, 2FA obrigatório só em um deles, bloqueio progressivo,
  auditoria e sessões revogáveis. Envergar uma biblioteca para isso daria
  mais código, não menos.
- **scrypt do `node:crypto`** em vez de argon2/bcrypt: sem binário nativo,
  sem risco de build quebrado, parâmetros OWASP.
- **TOTP próprio** (~60 linhas) em vez de `otplib`: menos superfície de
  cadeia de suprimentos em código que protege o painel administrativo.
- **Sons sintetizados em Web Audio** em vez de arquivos de áudio: a CSP
  bloqueia terceiros, o bundle fica leve e o feedback é instantâneo.

---

## Mapa de rotas

```
/                         site institucional (estático)
/entrar                   login do responsável
/cadastrar                cadastro + consentimento
/privacidade  /termos     documentos legais

/familia                  perfis das crianças, uso de hoje
/familia/perfis/novo      criação de perfil
/familia/perfis/[id]      edição e exclusão
/familia/progresso        relatório: 7 dias, habilidades, jogos
/familia/conta            dados, sessões, exportar, excluir conta

/kids                     escolha de perfil ou feed de jogos
/kids/jogo/[slug]         jogo em tela cheia
/kids/fim                 despedida quando o tempo acaba
/kids/adultos             portão parental (única saída)

/admin/login              login administrativo (fora do layout protegido)
/admin                    visão geral
/admin/familias           busca e lista de contas
/admin/familias/[id]      detalhe, suspensão, plano, exclusão
/admin/conteudo           publicar/despublicar, marcar Plus
/admin/admins             equipe e papéis
/admin/auditoria          log filtrável + logins falhos
/admin/seguranca          2FA e troca de senha do próprio admin

/api/auth/{cadastrar,entrar,sair}
/api/admin/{entrar,sair}
/api/kids/progresso            heartbeat + resultado de partida
/api/familia/exportar          portabilidade LGPD
```

`src/middleware.ts` barra rotas privadas na borda checando **presença** de
cookie. A validação real (assinatura, expiração, revogação, status da conta)
acontece em cada layout e rota no servidor — o middleware é otimização e
defesa em profundidade, nunca o único controle.

---

## Organização do código

```
prisma/
  schema.prisma        modelo de dados (sem enums, para trocar SQLite↔Postgres)
  seed.ts              catálogo de jogos + primeiro administrador
scripts/
  verificar-seguranca.ts  testes de TOTP, portão parental e senha
src/
  app/                 rotas (App Router)
  components/ui.tsx    design system da área adulta
  games/
    catalog.ts         fonte única da verdade do conteúdo
    registry.ts        slug → componente, com import dinâmico
    sound.ts           Web Audio + narração pt-BR
    utils.ts           shuffle, random, estrelas
    components/        GameShell, WinOverlay, useGameSession
    impl/              os nove jogos
  lib/
    db.ts              cliente Prisma (singleton)
    env.ts             variáveis validadas, falha rápido
    password.ts        scrypt + política de força
    tokens.ts          token opaco + hash
    session.ts         dois realms, permissões por papel
    totp.ts            RFC 6238
    parental-gate.ts   desafio assinado por HMAC
    rate-limit.ts      janela deslizante (trocar por Redis em produção)
    audit.ts           log de auditoria e tentativas de login
    screen-time.ts     limite diário, contado no servidor
    validation.ts      schemas Zod
    avatars.ts         emojis e cores de tema
    consent.ts         versão vigente dos termos
```

### Como adicionar um jogo novo

1. Descreva o jogo em `src/games/catalog.ts`, incluindo `learningGoals`.
2. Crie o componente em `src/games/impl/`, usando `GameShell`,
   `useGameSession` e `sfx`/`speak`.
3. Registre o slug em `src/games/registry.ts`.
4. `npm run db:seed` — o catálogo é sincronizado com o banco.

O `useGameSession` cuida sozinho do heartbeat de tempo de tela e do envio do
resultado; o jogo só chama `finish(score, stars)` ao terminar.

---

## Modelo de dados

Onze modelos: `Guardian`, `GuardianSession`, `VerificationToken`,
`ChildProfile`, `Game`, `GameProgress`, `PlaySession`, `Reward`, `AdminUser`,
`AdminSession`, `AuditLog`, `LoginAttempt`.

Duas decisões que valem registro:

- **Sem enums no Prisma.** Campos como `status`, `plan` e `role` são `String`
  validadas por Zod na aplicação. Isso permite trocar o provider de SQLite
  para PostgreSQL sem reescrever o schema.
- **`PlaySession.dayKey`** guarda o dia local como texto (`YYYY-MM-DD`).
  Somar uso diário vira uma agregação trivial, sem aritmética de fuso a cada
  consulta.

---

## Desenvolvimento

```bash
cp .env.example .env      # ajuste AUTH_SECRET
npm install
npm run setup             # prisma db push + seed
npm run dev               # http://localhost:3000
```

Outros comandos: `npm run build`, `npm run typecheck`,
`npm run test:seguranca`, `npm run db:studio`.

## Produção — o que muda

1. `provider = "postgresql"` no `schema.prisma` e `prisma migrate deploy`.
2. `AUTH_SECRET` forte, gerado com
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
   guardado em gerenciador de segredos.
3. `APP_ORIGIN` com o domínio real (a checagem anti-CSRF depende disso).
4. Rate limit em Redis.
5. CSP sem `'unsafe-inline'`/`'unsafe-eval'`, usando nonce.
6. Backup do banco e rotina de expurgo de logs após 6 meses.
