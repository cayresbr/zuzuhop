import { Hop } from "@/components/mascots";
import { createChallenge } from "@/lib/parental-gate";
import { GateForm } from "./gate-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Área dos adultos — Zuzuhop" };

export default function PortaoParentalPage() {
  const challenge = createChallenge();

  return (
    // Fundo sóbrio de propósito: sinaliza "isto não é a área de brincar".
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-ink via-grape-700 to-grape-600 p-6">
      <div className="dots pointer-events-none absolute inset-0 opacity-10" aria-hidden />

      <div className="relative w-full max-w-md rounded-blob bg-cream p-8 text-center shadow-2xl">
        <div className="-mt-24 flex justify-center">
          <Hop mood="curioso" size={104} className="drop-shadow-xl" />
        </div>

        <div className="mt-1 inline-flex items-center gap-2 rounded-pill bg-grape-100 px-4 py-1.5 text-sm font-extrabold text-grape-700">
          <span aria-hidden>🔒</span> Área dos adultos
        </div>

        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">
          Chame um adulto, por favor
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Esta pergunta existe para que a criança não saia sozinha do modo de
          brincar.
        </p>

        <GateForm question={challenge.question} token={challenge.token} />
      </div>
    </div>
  );
}
