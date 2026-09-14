import { createChallenge } from "@/lib/parental-gate";
import { GateForm } from "./gate-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Área dos adultos — Zuzuhop" };

export default function PortaoParentalPage() {
  const challenge = createChallenge();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ink to-grape-700 p-6">
      <div className="w-full max-w-md rounded-blob bg-white p-8 text-center shadow-2xl">
        <div className="text-5xl" aria-hidden>
          🔒
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">Área dos adultos</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Peça a um adulto para responder. Esta pergunta existe para que a
          criança não saia sozinha do modo de brincar.
        </p>
        <GateForm question={challenge.question} token={challenge.token} />
      </div>
    </div>
  );
}
