import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="text-7xl" aria-hidden>
        🐰
      </div>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">
        Essa página fugiu daqui
      </h1>
      <p className="mt-2 text-ink-soft">Vamos voltar para um lugar conhecido?</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-grape-500 px-6 py-4 text-lg font-bold text-white"
      >
        Ir para o início
      </Link>
    </main>
  );
}
