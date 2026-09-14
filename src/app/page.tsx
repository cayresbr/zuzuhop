import Link from "next/link";
import { ZuzuEHop, Zuzu, Hop } from "@/components/mascots";
import { GAMES, CATEGORY_LABELS } from "@/games/catalog";

const PILLARS = [
  {
    emoji: "🔒",
    title: "Segurança de verdade",
    text: "Sem anúncios, sem chat, sem links para fora. Dois logins separados: família e administração.",
    tone: "bg-grape-100",
  },
  {
    emoji: "⏱️",
    title: "Tempo de tela no controle",
    text: "Você define quantos minutos por dia. Quando acaba, o app se despede com carinho.",
    tone: "bg-mint-100",
  },
  {
    emoji: "📊",
    title: "Relatório para você",
    text: "O que a criança jogou, por quanto tempo e quais habilidades desenvolveu.",
    tone: "bg-mango-100",
  },
  {
    emoji: "🧠",
    title: "Brincar é o método",
    text: "Letras, números, música, lógica, arte, ciências e emoções — sempre em formato de jogo.",
    tone: "bg-sky-100",
  },
];

const TILE: Record<string, string> = {
  grape: "bg-grape-500",
  mango: "bg-mango-400",
  mint: "bg-mint-500",
  sky: "bg-sky-500",
  coral: "bg-coral-500",
  lime: "bg-lime-500",
};

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ---------------------------------------------------------------- topo */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-6">
        <span className="flex items-center gap-2 font-display text-2xl font-extrabold text-grape-600">
          <Zuzu size={38} />
          Zuzuhop
        </span>
        <nav className="flex items-center gap-2">
          <Link
            href="/entrar"
            className="rounded-pill px-4 py-2.5 font-display font-extrabold text-grape-600 transition hover:bg-grape-50"
          >
            Entrar
          </Link>
          <Link
            href="/cadastrar"
            className="chunky bg-grape-500 px-5 py-2.5 font-display font-extrabold text-white"
            style={{ "--chunky-shade": "#4d22b4" } as React.CSSProperties}
          >
            Criar conta
          </Link>
        </nav>
      </header>

      {/* ---------------------------------------------------------------- herói */}
      <section className="relative">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-mint-200 opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-mango-200 opacity-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-8 text-center">
          <ZuzuEHop size={170} className="mb-4" />

          <h1 className="font-display text-4xl font-extrabold leading-[1.08] text-ink sm:text-6xl">
            Um lugar seguro para
            <br />
            <span className="text-grape-600">brincar e aprender</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            Jogos e atividades para crianças de 2 a 8 anos. Feito para meninas e
            meninos, com o controle todo nas mãos de quem cuida.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/cadastrar"
              className="chunky bg-grape-500 px-8 py-4 font-display text-lg font-extrabold text-white"
              style={{ "--chunky-shade": "#4d22b4" } as React.CSSProperties}
            >
              Começar de graça 🎈
            </Link>
            <Link
              href="/entrar"
              className="chunky bg-white px-8 py-4 font-display text-lg font-extrabold text-grape-600"
              style={{ "--chunky-shade": "#d6c5ff" } as React.CSSProperties}
            >
              Já tenho conta
            </Link>
          </div>

          <p className="mt-4 text-sm font-bold text-ink-faint">
            Sem cartão de crédito · Sem anúncios · Sem coleta de dados da criança
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- vitrine */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-center font-display text-2xl font-extrabold text-ink">
          Alguns dos jogos que esperam por vocês
        </h2>

        <div className="rail mt-7 flex gap-4 overflow-x-auto pb-4 sm:justify-center sm:flex-wrap">
          {GAMES.map((game, index) => (
            <div
              key={game.slug}
              className={`chunky chunky-card glossy relative flex h-36 w-36 shrink-0 flex-col items-center justify-center gap-2 overflow-hidden ${TILE[game.color] ?? TILE.grape}`}
              style={
                {
                  "--chunky-shade": "rgba(0,0,0,0.28)",
                  animation: `float-slow ${4 + (index % 3) * 0.6}s ease-in-out ${index * 0.18}s infinite`,
                } as React.CSSProperties
              }
            >
              <span className="dots absolute inset-0 opacity-25" aria-hidden />
              <span className="relative text-4xl drop-shadow" aria-hidden>
                {game.emoji}
              </span>
              <span className="relative rounded-pill bg-white/95 px-2.5 py-1 text-center font-display text-xs font-extrabold leading-tight text-ink">
                {game.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- pilares */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-blob bg-white p-6 soft-shadow">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pillar.tone} text-3xl`}
                aria-hidden
              >
                {pillar.emoji}
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold text-ink">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- categorias */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-center font-display text-2xl font-extrabold text-ink">
          O que tem para explorar
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
            <span
              key={key}
              className="rounded-pill bg-white px-5 py-3 font-display font-extrabold text-ink-soft soft-shadow"
            >
              <span aria-hidden>{value.emoji}</span> {value.label}
            </span>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ chamada */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-blob bg-gradient-to-br from-grape-500 to-grape-700 px-8 py-12 text-center">
          <span className="confetti-paper pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <Hop mood="comemorando" size={96} className="relative mx-auto animate-hop" />
          <h2 className="relative mt-4 font-display text-3xl font-extrabold text-white">
            Vamos brincar?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/90">
            Crie a conta em um minuto, monte o perfil da criança e escolha
            quanto tempo de tela faz sentido para a sua família.
          </p>
          <Link
            href="/cadastrar"
            className="chunky relative mt-8 inline-block bg-white px-8 py-4 font-display text-lg font-extrabold text-grape-700"
            style={{ "--chunky-shade": "#b99cff" } as React.CSSProperties}
          >
            Criar conta gratuita
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------------- rodapé */}
      <footer className="border-t border-grape-100 py-8 text-center text-sm text-ink-soft">
        <div className="flex flex-wrap justify-center gap-5">
          <Link href="/privacidade" className="font-bold hover:text-grape-600">
            Privacidade
          </Link>
          <Link href="/termos" className="font-bold hover:text-grape-600">
            Termos de uso
          </Link>
          <Link href="/admin/login" className="font-bold hover:text-grape-600">
            Área administrativa
          </Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Zuzuhop</p>
      </footer>
    </div>
  );
}
