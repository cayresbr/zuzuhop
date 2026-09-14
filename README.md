# Zuzuhop 🐰

Plataforma de jogos e atividades para crianças de **2 a 8 anos**, inspirada no
Lingokids, com controle parental de verdade e privacidade em primeiro lugar.

> Segurança não é uma camada aplicada depois: a conta é sempre do adulto, a
> criança nunca tem credencial, o limite de tempo de tela é contado no
> servidor e o painel administrativo vive em um realm totalmente separado,
> com segundo fator obrigatório.

---

## Começando

```bash
cp .env.example .env      # ajuste AUTH_SECRET antes de qualquer coisa
npm install
npm run setup             # cria o banco e popula o catálogo + admin
npm run dev               # http://localhost:3000
```

**Primeiro acesso administrativo:** `/admin/login` com as credenciais de
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (padrão
`admin@zuzuhop.com` / `Admin@123456`). No primeiro login o painel força a
configuração do segundo fator e a troca da senha temporária.

**Primeiro acesso da família:** crie uma conta em `/cadastrar`, depois um
perfil infantil, e toque em **Brincar**.

---

## O que já funciona

### Para a família
- Cadastro do responsável com consentimento registrado (data, IP e versão).
- Até 6 perfis infantis, cada um com apelido, avatar, cor, limite de tempo e
  categorias liberadas.
- Relatório de progresso: uso dos últimos 7 dias, habilidades desenvolvidas e
  histórico por jogo.
- Sessões ativas visíveis e revogáveis.
- Exportar todos os dados em JSON e excluir a conta inteira, sem atendimento.

### Para a criança
Nove jogos jogáveis, todos com narração em português e sem texto obrigatório:

| Jogo | O que treina |
|---|---|
| 🐯 Memória dos Bichos | memória visual, atenção |
| 🚀 Conta Comigo | contagem até 10, quantidade × numeral |
| 🅰️ Caça-Letras | consciência fonológica, letra inicial |
| 🎨 Mundo das Cores | classificação por atributo, motricidade fina |
| 🎹 Piano Maluco | memória auditiva sequencial, ritmo |
| 🖌️ Ateliê de Pintura | criação livre (sem pontuação, sem errar) |
| 🔮 Sequência Mágica | padrões, pensamento algorítmico |
| 🛸 Labirinto do Foguete | programação em blocos, orientação espacial |
| 💛 Como Eu Me Sinto | vocabulário emocional, autorregulação |

### Para a administração
Visão geral com métricas, gestão de famílias (suspender, plano, excluir),
curadoria de conteúdo (publicar, marcar como Plus), equipe com papéis e
permissões, log de auditoria filtrável e configuração do próprio 2FA.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma ·
SQLite em desenvolvimento, PostgreSQL em produção.

Cinco dependências no total. Autenticação, TOTP, portão parental e efeitos
sonoros são implementação própria — os motivos estão em
[`docs/arquitetura.md`](docs/arquitetura.md).

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run typecheck` | checagem de tipos |
| `npm run test:seguranca` | testa TOTP, portão parental e hashing de senha |
| `npm run setup` | cria o banco e roda o seed |
| `npm run db:studio` | inspeciona o banco |

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/pesquisa-lingokids.md`](docs/pesquisa-lingokids.md) | Estudo completo do Lingokids: método, navegação, jogos, personagens, modelo de negócio, UX infantil, gamificação, conformidade — e o que trouxemos de cada coisa |
| [`docs/roadmap.md`](docs/roadmap.md) | O que sugiro implantar a seguir, priorizado, e os anti-padrões que decidimos não adotar |
| [`docs/seguranca.md`](docs/seguranca.md) | Modelo de segurança completo e o que falta antes de produção |
| [`docs/arquitetura.md`](docs/arquitetura.md) | Stack, decisões, mapa de rotas e como adicionar um jogo novo |

---

## Aviso

Projeto em desenvolvimento. Antes de ir a produção, leia a seção 13 de
[`docs/seguranca.md`](docs/seguranca.md) — há itens conhecidos e listados
(PostgreSQL, rate limit distribuído, recuperação de senha, CSP com nonce).
