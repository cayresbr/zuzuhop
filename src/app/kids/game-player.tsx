"use client";

import { useEffect } from "react";
import { setSoundEnabled } from "@/games/sound";

/** Aplica as preferências de som do perfil antes de montar o jogo. */
export function GamePlayer({
  soundEnabled,
  children,
}: {
  soundEnabled: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  return <>{children}</>;
}
