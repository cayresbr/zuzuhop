"use client";

import { useEffect, useState } from "react";
import { Zuzu } from "@/components/mascots";
import { setSoundEnabled } from "@/games/sound";
import { getGameComponent } from "@/games/registry";

/** Mapa estático: o Tailwind não gera classes montadas por interpolação. */
const LOADING_BG: Record<string, string> = {
  grape: "bg-grape-400",
  mango: "bg-mango-400",
  mint: "bg-mint-400",
  sky: "bg-sky-400",
  coral: "bg-coral-400",
  lime: "bg-lime-400",
};

/**
 * Resolve o componente do jogo no cliente e aplica as preferências de som do
 * perfil antes de montá-lo.
 */
export function GamePlayer({
  slug,
  soundEnabled,
  color,
}: {
  slug: string;
  soundEnabled: boolean;
  color: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
    setMounted(true);
  }, [soundEnabled]);

  const Game = getGameComponent(slug);
  if (!Game) return null;

  // Tela de espera com a Zuzu: um instante em branco assusta criança pequena.
  if (!mounted) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${LOADING_BG[color] ?? LOADING_BG.grape}`}
      >
        <Zuzu mood="curioso" size={140} className="animate-hop" />
      </div>
    );
  }

  return <Game />;
}
