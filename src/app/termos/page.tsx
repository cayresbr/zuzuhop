import Link from "next/link";
import { CONSENT_VERSION } from "@/lib/consent";

export const metadata = { title: "Termos de uso — Zuzuhop" };

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm font-bold text-grape-600">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">Termos de uso</h1>
      <p className="mt-1 text-sm text-ink-soft">Versão {CONSENT_VERSION}</p>

      <div className="mt-8 space-y-6 text-ink-soft">
        <section>
          <h2 className="text-xl font-extrabold text-ink">Quem pode criar conta</h2>
          <p className="mt-2">
            Apenas maiores de 18 anos, na condição de pai, mãe ou responsável
            legal pelas crianças que usarão o serviço. A criança nunca cria conta
            própria nem informa dados pessoais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Uso responsável</h2>
          <p className="mt-2">
            O Zuzuhop é uma ferramenta de apoio ao brincar e não substitui a
            mediação de um adulto. O tempo de tela padrão segue as recomendações
            pediátricas e pode ser ajustado pelo responsável a qualquer momento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Conta e segurança</h2>
          <p className="mt-2">
            O responsável é quem guarda a senha. Áreas de adulto ficam atrás de um
            portão parental. Suspeitando de acesso indevido, encerre todas as
            sessões na área de conta e troque a senha.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Planos</h2>
          <p className="mt-2">
            O plano gratuito dá acesso a um conjunto de jogos. O plano Plus libera
            todo o catálogo. Nenhuma compra pode ser iniciada dentro do modo
            criança.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Encerramento</h2>
          <p className="mt-2">
            O responsável pode excluir a conta a qualquer momento, sem custo e sem
            precisar justificar.
          </p>
        </section>
      </div>
    </main>
  );
}
