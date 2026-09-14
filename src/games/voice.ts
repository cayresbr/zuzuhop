"use client";

/**
 * Voz do Zuzuhop.
 *
 * O que deixa a narração robotizada não é a Web Speech API em si — é o padrão
 * dela. O navegador entrega a PRIMEIRA voz que casa com o idioma, que no Linux
 * costuma ser o eSpeak e no macOS a variante "compact". Aqui fazemos três
 * coisas que mudam a percepção por completo:
 *
 * 1. ESCOLHA DA VOZ. Pontuamos todas as vozes disponíveis e ficamos com a
 *    melhor: vozes neurais (Google, Microsoft Natural/Online) na frente,
 *    sintetizadores antigos no fim da fila.
 * 2. PROSÓDIA. Tom 1,15 e fala picada soam de robô. Usamos tom próximo do
 *    natural, velocidade quase normal e uma variação minúscula a cada frase —
 *    porque o que mais denuncia uma máquina é repetir algo IDÊNTICO.
 * 3. FRASEADO. A fala é quebrada em orações e emendada com micropausas, do
 *    jeito que uma pessoa respira. E as falas de reforço vêm de um repertório
 *    variado: ninguém diz "muito bem" oito vezes seguidas.
 */

let enabled = true;
let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceResolved = false;

/** Pistas de vozes neurais/naturais modernas — as que soam humanas. */
const NEURAL_HINTS = [
  "natural",
  "neural",
  "online",
  "wavenet",
  "journey",
  "premium",
  "enhanced",
  "siri",
];

/** Sintetizadores antigos: inteligíveis, mas metálicos. */
const ROBOTIC_HINTS = ["espeak", "festival", "compact", "pico", "flite", "mbrola"];

/** Vozes pt-BR reconhecidamente boas, por plataforma. */
const PREFERRED_NAMES = [
  "francisca", // Microsoft Natural (Windows/Edge)
  "thalita",
  "antonio",
  "brenda",
  "elza",
  "giovanna",
  "leticia",
  "yara",
  "luciana", // Apple
  "google português do brasil",
  "google portugues do brasil",
];

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase().replace("_", "-");
  const name = voice.name.toLowerCase();

  // Idioma errado é eliminatório: pt-PT lendo texto do Brasil soa estrangeiro.
  if (!lang.startsWith("pt")) return -1;

  let score = lang.startsWith("pt-br") ? 100 : 40;

  if (PREFERRED_NAMES.some((preferred) => name.includes(preferred))) score += 45;
  if (NEURAL_HINTS.some((hint) => name.includes(hint))) score += 35;
  if (ROBOTIC_HINTS.some((hint) => name.includes(hint))) score -= 60;

  // Voz de servidor costuma ser a neural; a local costuma ser a antiga.
  if (!voice.localService) score += 20;
  if (voice.default) score += 5;

  return score;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const ranked = voices
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.voice ?? null;
}

/**
 * As vozes carregam de forma assíncrona no Chrome: na primeira chamada
 * getVoices() volta vazio e só depois dispara `voiceschanged`.
 */
export function initVoice(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const resolve = () => {
    const voice = pickVoice();
    if (voice) {
      cachedVoice = voice;
      voiceResolved = true;
    }
  };

  resolve();
  if (!voiceResolved) {
    window.speechSynthesis.addEventListener("voiceschanged", resolve, { once: true });
  }
}

export function setVoiceEnabled(value: boolean): void {
  enabled = value;
  if (!value && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Nome da voz em uso — exibido nas preferências do perfil. */
export function currentVoiceName(): string | null {
  return cachedVoice?.name ?? null;
}

/**
 * Quebra o texto em orações. Falar "Oi, Tetê! O que vamos brincar hoje?" como
 * duas falas emendadas produz a pausa natural entre elas; num bloco só, a
 * maioria dos sintetizadores atropela a vírgula.
 */
function toPhrases(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+|(?<=,)\s+(?=(?:e|mas|então|agora|depois)\b)/i)
    .map((phrase) => phrase.trim())
    .filter(Boolean);
}

/** Variação minúscula por frase: é o que tira o efeito de "gravação colada". */
function humanize(index: number): { rate: number; pitch: number } {
  const drift = Math.sin(Date.now() / 900 + index * 2.3);
  return {
    // 0,97 é quase o ritmo de conversa; abaixo de 0,9 já soa arrastado.
    rate: 0.97 + drift * 0.035,
    // Tom levemente acima do neutro: acolhedor sem virar desenho animado.
    pitch: 1.06 + drift * 0.04,
  };
}

export interface SpeakOptions {
  /** Interrompe o que estiver sendo falado. Padrão: true. */
  interrupt?: boolean;
  /** Atraso antes de começar, em ms. */
  delayMs?: number;
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!enabled || !text.trim()) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const synth = window.speechSynthesis;
  if (!voiceResolved) initVoice();

  const start = () => {
    try {
      if (options.interrupt !== false) synth.cancel();

      toPhrases(text).forEach((phrase, index) => {
        const utterance = new SpeechSynthesisUtterance(phrase);
        const { rate, pitch } = humanize(index);

        utterance.lang = "pt-BR";
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;
        if (cachedVoice) utterance.voice = cachedVoice;

        synth.speak(utterance);
      });
    } catch {
      // Narração é reforço, nunca requisito: o jogo segue sem ela.
    }
  };

  if (options.delayMs) {
    window.setTimeout(start, options.delayMs);
  } else {
    start();
  }
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

/* ===========================================================================
   Repertório de falas
   ---------------------------------------------------------------------------
   Um app que repete a mesma frase soa programado. Um que varia soa vivo.
   O sorteio nunca repete a última fala usada.
   =========================================================================== */

const lastSpoken = new Map<string, string>();

function pickFresh(key: string, options: readonly string[]): string {
  const previous = lastSpoken.get(key);
  const pool = options.length > 1 ? options.filter((item) => item !== previous) : options;
  const chosen = pool[Math.floor(Math.random() * pool.length)]!;
  lastSpoken.set(key, chosen);
  return chosen;
}

const PRAISE = [
  "Isso!",
  "Muito bem!",
  "Boa!",
  "Acertou!",
  "É isso aí!",
  "Você conseguiu!",
  "Perfeito!",
  "Uau, que capricho!",
  "Mandou bem!",
] as const;

const RETRY = [
  "Quase!",
  "Opa, essa não. Tenta outra.",
  "Hum... olha de novo.",
  "Por pouco! Vamos tentar mais uma vez.",
  "Essa não foi. Sem problema, tenta de novo.",
  "Ainda não. Você consegue!",
] as const;

const VICTORY = [
  "Você conseguiu! Que orgulho!",
  "Terminou tudo! Você é demais!",
  "Uhuuu! Conseguiu chegar ao fim!",
  "Parabéns! Você arrasou nessa!",
  "Que show! Terminou tudinho!",
] as const;

const NEXT_LEVEL = [
  "Boa! Agora vem uma mais difícil.",
  "Isso! Bora para a próxima.",
  "Muito bem! A próxima é maiorzinha.",
  "Show! Vamos subir de nível.",
] as const;

/** "Muito bem!" com variação — use no lugar de texto fixo de acerto. */
export function praise(): void {
  speak(pickFresh("praise", PRAISE));
}

export function encourage(): void {
  speak(pickFresh("retry", RETRY));
}

export function celebrate(): void {
  speak(pickFresh("victory", VICTORY));
}

export function nextLevel(): void {
  speak(pickFresh("level", NEXT_LEVEL));
}

/** Saudação da tela inicial, variada por visita. */
export function greet(nickname: string): void {
  const options = [
    `Oi, ${nickname}! O que a gente vai brincar hoje?`,
    `Olá, ${nickname}! Escolhe um joguinho.`,
    `${nickname}! Que bom te ver. Vamos brincar?`,
    `Oi, ${nickname}! Tem um monte de coisa nova aqui.`,
  ];
  speak(pickFresh("greet", options));
}
