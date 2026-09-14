import { AVATARS, THEME_COLORS } from "./validation";

export const AVATAR_EMOJI: Record<(typeof AVATARS)[number], string> = {
  panda: "🐼",
  raposa: "🦊",
  dino: "🦖",
  astronauta: "🧑‍🚀",
  gatinho: "🐱",
  robo: "🤖",
  coruja: "🦉",
  leao: "🦁",
  polvo: "🐙",
  unicornio: "🦄",
  tubarao: "🦈",
  sapo: "🐸",
};

export const THEME_BG: Record<(typeof THEME_COLORS)[number], string> = {
  grape: "bg-grape-500",
  mango: "bg-mango-400",
  mint: "bg-mint-500",
  sky: "bg-sky-500",
  coral: "bg-coral-500",
  lime: "bg-lime-500",
};

export function avatarEmoji(avatar: string): string {
  return AVATAR_EMOJI[avatar as keyof typeof AVATAR_EMOJI] ?? "🐼";
}

export function themeBg(color: string): string {
  return THEME_BG[color as keyof typeof THEME_BG] ?? "bg-grape-500";
}

export function ageFromBirthYear(birthYear: number): number {
  return Math.max(0, new Date().getFullYear() - birthYear);
}
