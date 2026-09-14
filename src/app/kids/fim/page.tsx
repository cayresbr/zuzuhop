import Link from "next/link";

export const metadata = { title: "Até amanhã! — Zuzuhop" };

export default function FimPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-grape-500 to-grape-700 p-8 text-center">
      <div className="animate-float-slow text-8xl" aria-hidden>
        🌙
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
        Por hoje é só!
      </h1>
      <p className="mt-3 max-w-md text-lg text-white/90">
        O tempo de brincadeira de hoje acabou. Amanhã tem mais jogos esperando por
        você.
      </p>
      <p className="mt-8 text-white/80">Que tal brincar um pouco longe da tela agora?</p>

      <Link
        href="/kids/adultos"
        className="mt-10 rounded-full bg-white px-7 py-4 text-lg font-bold text-grape-600 shadow-lg"
      >
        Chamar um adulto 🔒
      </Link>
    </div>
  );
}
