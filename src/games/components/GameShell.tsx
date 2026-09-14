"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sfx, speak } from "../sound";

const COLOR_BG: Record<string, string> = {
  grape: "from-grape-400 to-grape-600",
  mango: "from-mango-400 to-mango-600",
  mint: "from-mint-400 to-mint-600",
  sky: "from-sky-400 to-sky-600",
  coral: "from-coral-400 to-coral-600",
  lime: "from-lime-400 to-lime-600",
};

interface GameShellProps {
  title: string;
  emoji: string;
  color: string;
  /** Instrução falada em voz alta ao abrir o jogo (crianças pré-leitoras). */
  instruction: string;
  level?: number;
  totalLevels?: number;
  children: React.ReactNode;
}

export function GameShell({
  title,
  emoji,
  color,
  instruction,
  level,
  totalLevels,
  children,
}: GameShellProps) {
  const [narrated, setNarrated] = useState(false);

  // A narração automática precisa de um gesto do usuário em muitos navegadores;
  // por isso também oferecemos o botão "ouvir de novo".
  useEffect(() => {
    const timer = window.setTimeout(() => {
      speak(instruction);
      setNarrated(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [instruction]);

  return (
    <div
      className={`kid-mode min-h-screen bg-gradient-to-b ${COLOR_BG[color] ?? COLOR_BG.grape} px-4 py-4`}
    >
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <Link
          href="/kids"
          onClick={() => sfx.tap()}
          aria-label="Voltar para a tela inicial"
          className="tap-target flex items-center justify-center rounded-full bg-white/90 text-3xl shadow-lg transition active:scale-90"
        >
          🏠
        </Link>

        <div className="flex flex-1 flex-col items-center">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white drop-shadow sm:text-3xl">
            <span aria-hidden>{emoji}</span>
            {title}
          </h1>
          {level && totalLevels ? (
            <div
              className="mt-1 flex gap-1"
              aria-label={`Fase ${level} de ${totalLevels}`}
            >
              {Array.from({ length: totalLevels }, (_, index) => (
                <span
                  key={index}
                  className={`h-2 w-6 rounded-full ${
                    index < level ? "bg-white" : "bg-white/35"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => speak(instruction)}
          aria-label="Ouvir a instrução de novo"
          className="tap-target flex items-center justify-center rounded-full bg-white/90 text-3xl shadow-lg transition active:scale-90"
        >
          {narrated ? "🔊" : "🔈"}
        </button>
      </header>

      <main className="mx-auto mt-6 w-full max-w-5xl">{children}</main>
    </div>
  );
}

interface WinOverlayProps {
  stars: number;
  onReplay: () => void;
  message?: string;
}

export function WinOverlay({ stars, onReplay, message }: WinOverlayProps) {
  useEffect(() => {
    sfx.win();
    speak(message ?? "Muito bem! Você conseguiu!");
  }, [message]);

  return (
    <div
      role="alertdialog"
      aria-label="Parabéns"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6 backdrop-blur-sm"
    >
      <div className="animate-pop-in w-full max-w-sm rounded-blob bg-white p-8 text-center shadow-2xl">
        <div className="text-6xl" aria-hidden>
          🎉
        </div>
        <p className="mt-3 text-2xl font-extrabold text-ink">
          {message ?? "Muito bem!"}
        </p>
        <div className="mt-4 flex justify-center gap-2" aria-label={`${stars} de 3 estrelas`}>
          {[1, 2, 3].map((index) => (
            <span
              key={index}
              className={`text-5xl transition ${index <= stars ? "" : "opacity-25 grayscale"}`}
              aria-hidden
            >
              ⭐
            </span>
          ))}
        </div>
        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              sfx.tap();
              onReplay();
            }}
            className="tap-target rounded-full bg-grape-500 px-6 py-4 text-xl font-bold text-white shadow-lg transition active:scale-95"
          >
            Jogar de novo 🔁
          </button>
          <Link
            href="/kids"
            onClick={() => sfx.tap()}
            className="tap-target flex items-center justify-center rounded-full bg-mint-400 px-6 py-4 text-xl font-bold text-white shadow-lg transition active:scale-95"
          >
            Outros jogos 🎈
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Cartão de "tempo esgotado" — encerra a sessão com acolhimento, sem culpa. */
export function TimeUpOverlay() {
  useEffect(() => {
    speak("Por hoje é só! Amanhã tem mais diversão.");
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-6">
      <div className="animate-pop-in w-full max-w-sm rounded-blob bg-white p-8 text-center shadow-2xl">
        <div className="text-6xl" aria-hidden>
          🌙
        </div>
        <p className="mt-3 text-2xl font-extrabold text-ink">Por hoje é só!</p>
        <p className="mt-2 text-lg text-ink-soft">
          Amanhã tem mais diversão esperando por você.
        </p>
        <Link
          href="/kids/fim"
          className="tap-target mt-6 flex items-center justify-center rounded-full bg-grape-500 px-6 py-4 text-xl font-bold text-white shadow-lg"
        >
          Tchau! 👋
        </Link>
      </div>
    </div>
  );
}
