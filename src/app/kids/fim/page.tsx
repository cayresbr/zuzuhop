import Link from "next/link";
import { NightScene } from "@/components/scenery";
import { Zuzu } from "@/components/mascots";
import { GoodbyeSound } from "./goodbye-sound";

export const metadata = { title: "Até amanhã! — Zuzuhop" };

export default function FimPage() {
  return (
    <NightScene className="kid-mode">
      <GoodbyeSound />

      <div className="flex min-h-screen flex-col items-center justify-center px-8 py-12 text-center">
        <Zuzu mood="sonolento" size={170} className="animate-breathe drop-shadow-2xl" />

        <h1 className="mt-6 font-display text-3xl font-extrabold text-white sm:text-4xl">
          Por hoje é só!
        </h1>
        <p className="mt-3 max-w-md text-lg text-white/90">
          O tempo de brincadeira de hoje acabou. Amanhã tem mais jogos esperando
          por você.
        </p>

        <div className="mt-8 rounded-blob bg-white/15 px-6 py-4 backdrop-blur-sm">
          <p className="text-white/90">
            Que tal brincar um pouco longe da tela agora?
          </p>
        </div>

        <Link
          href="/kids/adultos"
          className="chunky tap-target mt-10 flex items-center justify-center bg-white px-7 py-4 text-lg font-extrabold text-grape-700"
          style={{ "--chunky-shade": "#d6c5ff" } as React.CSSProperties}
        >
          Chamar um adulto 🔒
        </Link>
      </div>
    </NightScene>
  );
}
