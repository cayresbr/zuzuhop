import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Cada jogo entra no bundle sob demanda: a home infantil carrega rápido
 * mesmo em tablets antigos, e só o jogo escolhido é baixado.
 */
const loading = () => null;

export const GAME_COMPONENTS: Record<string, ComponentType> = {
  "memoria-dos-bichos": dynamic(() => import("./impl/MemoriaDosBichos"), { loading }),
  "conta-comigo": dynamic(() => import("./impl/ContaComigo"), { loading }),
  "caca-letras": dynamic(() => import("./impl/CacaLetras"), { loading }),
  "mundo-das-cores": dynamic(() => import("./impl/MundoDasCores"), { loading }),
  "piano-maluco": dynamic(() => import("./impl/PianoMaluco"), { loading }),
  "atelie-de-pintura": dynamic(() => import("./impl/AtelieDePintura"), { loading }),
  "sequencia-magica": dynamic(() => import("./impl/SequenciaMagica"), { loading }),
  "labirinto-do-foguete": dynamic(() => import("./impl/LabirintoDoFoguete"), { loading }),
  "como-eu-me-sinto": dynamic(() => import("./impl/ComoEuMeSinto"), { loading }),
};

export function getGameComponent(slug: string): ComponentType | null {
  return GAME_COMPONENTS[slug] ?? null;
}
