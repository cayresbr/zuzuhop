import Link from "next/link";
import { CONSENT_VERSION } from "@/lib/consent";

export const metadata = { title: "Política de privacidade — Zuzuhop" };

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm font-bold text-grape-600">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">
        Política de privacidade
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Versão {CONSENT_VERSION}</p>

      <div className="mt-8 space-y-6 text-ink-soft">
        <section>
          <h2 className="text-xl font-extrabold text-ink">Em uma frase</h2>
          <p className="mt-2">
            Coletamos o mínimo necessário para o app funcionar, nunca vendemos
            dados, não exibimos publicidade e todo tratamento de dados de criança
            depende do consentimento do responsável.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">O que coletamos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Do responsável:</strong> nome, e-mail, senha (guardada apenas
              como hash), data e IP do consentimento, registros de acesso.
            </li>
            <li>
              <strong>Do perfil infantil:</strong> apelido, ano de nascimento,
              avatar, preferências e histórico de jogos. Sem nome completo, sem
              foto, sem e-mail, sem geolocalização, sem contatos.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">O que NÃO fazemos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Publicidade comportamental ou rastreamento entre aplicativos.</li>
            <li>Chat, comentários ou qualquer contato entre usuários.</li>
            <li>Venda ou compartilhamento de dados com anunciantes.</li>
            <li>Compras dentro do modo criança.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Base legal</h2>
          <p className="mt-2">
            O tratamento de dados de crianças ocorre no melhor interesse da
            criança, mediante consentimento específico e em destaque do pai, mãe
            ou responsável legal, conforme o art. 14 da Lei nº 13.709/2018
            (LGPD). O responsável pode revogar o consentimento a qualquer momento
            excluindo o perfil ou a conta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Seus direitos</h2>
          <p className="mt-2">
            Na área da família você pode, sem precisar falar com ninguém: baixar
            todos os dados em formato aberto, corrigir informações, excluir um
            perfil infantil e excluir a conta inteira com todo o histórico.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Retenção</h2>
          <p className="mt-2">
            Dados de perfil e progresso ficam enquanto a conta existir. Registros
            de acesso e de auditoria são mantidos por 6 meses, conforme o Marco
            Civil da Internet. A exclusão da conta apaga perfis, progresso e
            sessões imediatamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-ink">Contato</h2>
          <p className="mt-2">
            Encarregado de dados (DPO): privacidade@zuzuhop.com.br
          </p>
        </section>
      </div>
    </main>
  );
}
