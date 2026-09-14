"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Mapa slug -> componente do jogo.
 *
 * `ssr: false` é obrigatório aqui, não preferência: todo jogo sorteia a
 * primeira rodada ao montar. Renderizado no servidor, o sorteio acontece duas
 * vezes com resultados diferentes e o React acusa erro de hidratação — foi
 * exatamente o que apareceu no teste com navegador. Jogo é interativo por
 * natureza e não ganha nada com HTML pré-renderizado.
 *
 * O import dinâmico continua: só o jogo aberto entra no bundle.
 */
const loading = () => null;

export const GAME_COMPONENTS: Record<string, ComponentType> = {
  "memoria-dos-bichos": dynamic(() => import("./impl/MemoriaDosBichos"), { ssr: false, loading }),
  "conta-comigo": dynamic(() => import("./impl/ContaComigo"), { ssr: false, loading }),
  "caca-letras": dynamic(() => import("./impl/CacaLetras"), { ssr: false, loading }),
  "mundo-das-cores": dynamic(() => import("./impl/MundoDasCores"), { ssr: false, loading }),
  "piano-maluco": dynamic(() => import("./impl/PianoMaluco"), { ssr: false, loading }),
  "atelie-de-pintura": dynamic(() => import("./impl/AtelieDePintura"), { ssr: false, loading }),
  "sequencia-magica": dynamic(() => import("./impl/SequenciaMagica"), { ssr: false, loading }),
  "labirinto-do-foguete": dynamic(() => import("./impl/LabirintoDoFoguete"), { ssr: false, loading }),
  "como-eu-me-sinto": dynamic(() => import("./impl/ComoEuMeSinto"), { ssr: false, loading }),
};

export function getGameComponent(slug: string): ComponentType | null {
  return GAME_COMPONENTS[slug] ?? null;
}
