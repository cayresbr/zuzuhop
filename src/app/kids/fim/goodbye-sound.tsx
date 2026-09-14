"use client";

import { useEffect } from "react";
import { sfx, speak } from "@/games/sound";

/** Despedida falada e sonora — acolhedora, nunca punitiva. */
export function GoodbyeSound() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      sfx.goodbye();
      speak("Por hoje é só, viu? Amanhã a gente brinca mais. Até logo!");
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
