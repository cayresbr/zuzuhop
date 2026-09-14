import Link from "next/link";
import { GAMES, CATEGORY_LABELS } from "@/games/catalog";

const PILLARS = [
  {
    emoji: "🔒",
    title: "Segurança de verdade",
    text: "Sem anúncios, sem chat, sem links para fora. Dois logins separados: família e administração.",
  },
  {
    emoji: "⏱️",
    title: "Tempo de tela no controle",
    text: "O responsável define quantos minutos por dia. Quando acaba, o app se despede com carinho.",
  },
  {
    emoji: "📊",
    title: "Relatório para o responsável",
    text: "O que a criança jogou, por quanto tempo e quais habilidades desenvolveu.",
  },
  {
    emoji: "🧠",
    title: "Brincar é o método",
    text: "Letras, números, música, lógica, arte, ciências e emoções — sempre em formato de jogo.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-2xl font-extrabold text-grape-600">
          Zuzuhop <span aria-hidden>🐰</span>
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href="/entrar"
            className="rounded-full px-4 py-2 font-bold text-grape-600 hover:bg-grape-50"
          >
            Entrar
          </Link>
          <Link
            href="/cadastrar"
            className="rounded-full bg-grape-500 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-grape-600"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-6xl">
          Um lugar seguro para
          <span className="text-grape-600"> brincar e aprender</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
          Jogos e atividades para crianças de 2 a 8 anos. Feito para meninas e
          meninos, com controle total nas mãos de quem cuida.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/cadastrar"
            className="rounded-full bg-grape-500 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-grape-600"
          >
            Começar de graça
          </Link>
          <Link
            href="/entrar"
            className="rounded-full bg-white px-8 py-4 text-lg font-bold text-grape-600 shadow-lg hover:bg-grape-50"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {GAMES.slice(0, 6).map((game) => (
            <div
              key={game.slug}
              className="animate-float-slow flex w-32 flex-col items-center gap-1 rounded-3xl bg-white p-4 shadow-md"
              style={{ animationDelay: `${game.sortOrder * 30}ms` }}
            >
              <span className="text-4xl" aria-hidden>
                {game.emoji}
              </span>
              <span className="text-center text-sm font-bold text-ink">
                {game.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <span className="text-3xl" aria-hidden>
                {pillar.emoji}
              </span>
              <h2 className="mt-3 text-lg font-extrabold text-ink">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-center text-2xl font-extrabold text-ink">
          O que tem para explorar
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
            <span
              key={key}
              className="rounded-full bg-white px-5 py-3 font-bold text-ink-soft shadow-sm"
            >
              <span aria-hidden>{value.emoji}</span> {value.label}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-grape-100 py-8 text-center text-sm text-ink-soft">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/privacidade" className="hover:text-grape-600">
            Privacidade
          </Link>
          <Link href="/termos" className="hover:text-grape-600">
            Termos de uso
          </Link>
          <Link href="/admin/login" className="hover:text-grape-600">
            Área administrativa
          </Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Zuzuhop</p>
      </footer>
    </div>
  );
}
