"use client";

import { initVoice, setVoiceEnabled } from "./voice";

/**
 * Efeitos sonoros sintetizados na Web Audio API.
 *
 * Sem arquivos de áudio: a CSP bloqueia terceiros, o bundle fica leve e a
 * resposta ao toque é instantânea — feedback imediato é um dos pilares de UX
 * para criança pré-leitora.
 *
 * Os sons usam acordes e envelopes suaves em vez de bipes puros. Bipe quadrado
 * seco é o que faz um app soar barato; um acorde maior com ataque macio soa
 * como brinquedo de verdade.
 */

let context: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;

    context = new Ctor();
    master = context.createGain();
    master.gain.value = 0.85;
    master.connect(context.destination);
  }

  // Navegadores suspendem o contexto até o primeiro gesto do usuário.
  if (context.state === "suspended") void context.resume();
  return context;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  setVoiceEnabled(value);
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/**
 * Prepara áudio e voz no primeiro toque da criança. Sem isso, o primeiro som
 * do app sai atrasado ou nem sai (política de autoplay dos navegadores).
 */
export function primeAudio(): void {
  ensureContext();
  initVoice();
}

interface ToneOptions {
  frequency: number;
  durationMs?: number;
  type?: OscillatorType;
  volume?: number;
  delayMs?: number;
  /** Deslizamento até outra frequência — dá o "piu" de bolha e de erro. */
  glideTo?: number;
}

export function tone({
  frequency,
  durationMs = 180,
  type = "sine",
  volume = 0.16,
  delayMs = 0,
  glideTo,
}: ToneOptions): void {
  if (!enabled) return;
  const ctx = ensureContext();
  if (!ctx || !master) return;

  const startAt = ctx.currentTime + delayMs / 1000;
  const endAt = startAt + durationMs / 1000;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  if (glideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(glideTo, endAt);
  }

  // Envelope com ataque curto e cauda longa: soa como madeira/sino, não bipe.
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(volume * 0.6, startAt + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain).connect(master);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.06);
}

/** Toca várias notas juntas — acorde soa cheio onde a nota só soa pobre. */
function chord(frequencies: number[], options: Omit<ToneOptions, "frequency"> = {}) {
  frequencies.forEach((frequency, index) =>
    tone({
      ...options,
      frequency,
      // Micro-atraso entre as vozes: dá largura, como dedos num teclado.
      delayMs: (options.delayMs ?? 0) + index * 12,
      volume: (options.volume ?? 0.13) / Math.sqrt(frequencies.length),
    }),
  );
}

/** Escala de dó maior, usada pelo Piano Maluco e pelos acordes daqui. */
export const NOTES = {
  do: 261.63,
  re: 293.66,
  mi: 329.63,
  fa: 349.23,
  sol: 392.0,
  la: 440.0,
  si: 493.88,
  do2: 523.25,
  mi2: 659.25,
  sol2: 783.99,
  do3: 1046.5,
} as const;

export const sfx = {
  /** Toque neutro em botão de navegação. */
  tap: () =>
    tone({ frequency: 520, durationMs: 70, type: "triangle", volume: 0.09, glideTo: 660 }),

  /** Bolha estourando — para selecionar peças e cartas. */
  pop: () =>
    tone({ frequency: 380, durationMs: 90, type: "sine", volume: 0.13, glideTo: 920 }),

  /** Acerto: arpejo maior ascendente. Curto, alegre, não interrompe a fala. */
  correct: () => {
    tone({ frequency: NOTES.mi, durationMs: 140, type: "triangle", volume: 0.12 });
    tone({ frequency: NOTES.sol, durationMs: 150, type: "triangle", volume: 0.12, delayMs: 95 });
    chord([NOTES.do2, NOTES.mi2], { durationMs: 380, type: "triangle", delayMs: 195, volume: 0.16 });
  },

  /**
   * Erro: duas notas descendentes, suaves e graves.
   * Nunca uma buzina — o erro aqui é convite, não punição.
   */
  wrong: () => {
    tone({ frequency: 300, durationMs: 130, type: "sine", volume: 0.11 });
    tone({ frequency: 226, durationMs: 220, type: "sine", volume: 0.1, delayMs: 110 });
  },

  /** Vitória: fanfarra curta com acorde final cheio. */
  win: () => {
    const melody = [NOTES.do, NOTES.mi, NOTES.sol, NOTES.do2];
    melody.forEach((frequency, index) =>
      tone({ frequency, durationMs: 170, type: "triangle", volume: 0.14, delayMs: index * 125 }),
    );
    chord([NOTES.do2, NOTES.mi2, NOTES.sol2], {
      durationMs: 900,
      type: "triangle",
      delayMs: 520,
      volume: 0.2,
    });
  },

  /** Passagem de fase: dois acordes que sobem. */
  levelUp: () => {
    chord([NOTES.sol, NOTES.si], { durationMs: 220, type: "triangle", volume: 0.14 });
    chord([NOTES.do2, NOTES.mi2], { durationMs: 420, type: "triangle", delayMs: 170, volume: 0.16 });
  },

  /** Tempo de tela encerrado: descida macia, como quem apaga a luz. */
  goodbye: () => {
    [NOTES.sol, NOTES.mi, NOTES.do].forEach((frequency, index) =>
      tone({ frequency, durationMs: 320, type: "sine", volume: 0.12, delayMs: index * 230 }),
    );
  },
};

// Reexporta a camada de voz para que os jogos importem de um lugar só.
export {
  speak,
  praise,
  encourage,
  celebrate,
  nextLevel,
  greet,
  stopSpeaking,
  initVoice,
  currentVoiceName,
} from "./voice";
