"use client";

/**
 * Efeitos sonoros sintetizados via Web Audio API.
 *
 * Sem arquivos de áudio: zero requisições externas (a CSP bloqueia terceiros),
 * bundle leve e resposta instantânea ao toque — feedback imediato é um dos
 * pilares de UX para crianças pré-alfabetizadas.
 */

let context: AudioContext | null = null;
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
  }
  // Navegadores suspendem o contexto até a primeira interação do usuário.
  if (context.state === "suspended") void context.resume();
  return context;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}

interface ToneOptions {
  frequency: number;
  durationMs?: number;
  type?: OscillatorType;
  volume?: number;
  delayMs?: number;
}

export function tone({
  frequency,
  durationMs = 180,
  type = "sine",
  volume = 0.18,
  delayMs = 0,
}: ToneOptions) {
  if (!enabled) return;
  const ctx = ensureContext();
  if (!ctx) return;

  const startAt = ctx.currentTime + delayMs / 1000;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  // Envelope suave evita o "clique" desagradável no início/fim da nota.
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationMs / 1000);

  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + durationMs / 1000 + 0.05);
}

/** Notas em Hz da escala de dó maior — usadas pelo Piano Maluco. */
export const NOTES = {
  do: 261.63,
  re: 293.66,
  mi: 329.63,
  fa: 349.23,
  sol: 392.0,
  la: 440.0,
  si: 493.88,
  do2: 523.25,
} as const;

export const sfx = {
  tap: () => tone({ frequency: 620, durationMs: 90, type: "triangle", volume: 0.12 }),
  correct: () => {
    tone({ frequency: NOTES.mi, durationMs: 130, type: "triangle" });
    tone({ frequency: NOTES.sol, durationMs: 130, type: "triangle", delayMs: 110 });
    tone({ frequency: NOTES.do2, durationMs: 220, type: "triangle", delayMs: 220 });
  },
  wrong: () => {
    // Grave e curto: sinaliza "tente de novo" sem soar punitivo.
    tone({ frequency: 196, durationMs: 160, type: "sine", volume: 0.14 });
  },
  win: () => {
    const melody = [NOTES.do, NOTES.mi, NOTES.sol, NOTES.do2, NOTES.sol, NOTES.do2];
    melody.forEach((frequency, index) =>
      tone({ frequency, durationMs: 200, type: "triangle", delayMs: index * 140 }),
    );
  },
  pop: () => tone({ frequency: 880, durationMs: 70, type: "square", volume: 0.08 }),
};

/**
 * Narração por voz sintetizada (Web Speech API), em pt-BR.
 * Fundamental para crianças que ainda não leem: toda instrução é falada.
 */
export function speak(text: string) {
  if (!enabled) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Narração é um extra: se o navegador não suportar, o jogo segue normal.
  }
}
