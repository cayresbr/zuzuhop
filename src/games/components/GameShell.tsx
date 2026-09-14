"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Confetti } from "@/components/scenery";
import { Zuzu, Hop } from "@/components/mascots";
import { celebrate, primeAudio, sfx, speak } from "../sound";

/** Fundo e sombra sólida por cor de jogo. */
const THEME: Record<string, { bg: string; shade: string; pill: string }> = {
  grape: { bg: "from-grape-300 via-grape-400 to-grape-600", shade: "#4d22b4", pill: "text-grape-700" },
  mango: { bg: "from-mango-200 via-mango-400 to-mango-600", shade: "#9c5203", pill: "text-mango-700" },
  mint: { bg: "from-mint-200 via-mint-400 to-mint-600", shade: "#09684d", pill: "text-mint-700" },
  sky: { bg: "from-sky-200 via-sky-400 to-sky-600", shade: "#0e4c8a", pill: "text-sky-700" },
  coral: { bg: "from-coral-200 via-coral-400 to-coral-600", shade: "#9c1d1d", pill: "text-coral-700" },
  lime: { bg: "from-lime-200 via-lime-400 to-lime-600", shade: "#456d12", pill: "text-lime-700" },
};

interface GameShellProps {
  title: string;
  emoji: string;
  color: string;
  /** Instrução falada em voz alta ao abrir (crianças pré-leitoras). */
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
  const theme = THEME[color] ?? THEME.grape!;
  const [narrating, setNarrating] = useState(false);

  useEffect(() => {
    primeAudio();
    const timer = window.setTimeout(() => {
      speak(instruction);
      setNarrating(true);
      window.setTimeout(() => setNarrating(false), 2600);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [instruction]);

  return (
    <div className={`kid-mode min-h-screen bg-gradient-to-b ${theme.bg}`}>
      <div className="dots flex min-h-screen flex-col px-4 pb-10 pt-4">
        <header className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <Link
            href="/kids"
            onClick={() => sfx.tap()}
            aria-label="Voltar para a tela inicial"
            className="chunky tap-target flex items-center justify-center bg-white text-3xl"
            style={{ "--chunky-shade": "#d6c5ff" } as React.CSSProperties}
          >
            <span aria-hidden>🏠</span>
          </Link>

          <div className="flex flex-1 flex-col items-center gap-2">
            <h1 className="flex items-center gap-2 rounded-pill bg-white/95 px-5 py-2 text-xl font-extrabold text-ink shadow-lg sm:text-2xl">
              <span className="text-2xl sm:text-3xl" aria-hidden>
                {emoji}
              </span>
              {title}
            </h1>

            {level && totalLevels ? (
              <div
                className="flex items-center gap-1.5"
                aria-label={`Fase ${level} de ${totalLevels}`}
              >
                {Array.from({ length: totalLevels }, (_, index) => (
                  <span
                    key={index}
                    className={`h-3.5 rounded-pill transition-all duration-300 ${
                      index < level
                        ? "w-8 bg-white shadow"
                        : "w-3.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              primeAudio();
              speak(instruction);
              setNarrating(true);
              window.setTimeout(() => setNarrating(false), 2600);
            }}
            aria-label="Ouvir a instrução de novo"
            className={`chunky tap-target flex items-center justify-center bg-white text-3xl ${
              narrating ? "animate-wiggle" : ""
            }`}
            style={{ "--chunky-shade": "#d6c5ff" } as React.CSSProperties}
          >
            <span aria-hidden>{narrating ? "🔊" : "🔈"}</span>
          </button>
        </header>

        {/* Centraliza o conteúdo do jogo: numa fase curta a tela não fica
            com todo o peso preso no topo e um vazio embaixo. */}
        <main className="mx-auto mt-6 flex w-full max-w-5xl flex-1 flex-col justify-center">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Vitória
   --------------------------------------------------------------------------- */

interface WinOverlayProps {
  stars: number;
  onReplay: () => void;
  message?: string;
}

export function WinOverlay({ stars, onReplay, message }: WinOverlayProps) {
  // As estrelas aparecem uma a uma: a contagem é metade da comemoração.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    sfx.win();
    if (message) {
      speak(message);
    } else {
      celebrate();
    }

    const timers = Array.from({ length: stars }, (_, index) =>
      window.setTimeout(() => {
        setShown(index + 1);
        sfx.pop();
      }, 500 + index * 450),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [message, stars]);

  return (
    <>
      <Confetti />
      <div
        role="alertdialog"
        aria-label="Parabéns"
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-5 backdrop-blur-sm"
      >
        <div className="animate-pop-in w-full max-w-sm rounded-blob bg-cream p-7 text-center shadow-2xl">
          <div className="-mt-24 flex justify-center">
            <Zuzu mood="comemorando" size={130} className="animate-hop drop-shadow-xl" />
          </div>

          <p className="mt-2 font-display text-2xl font-extrabold text-ink">
            {message ?? "Você conseguiu!"}
          </p>

          <div
            className="mt-4 flex justify-center gap-2"
            aria-label={`${stars} de 3 estrelas`}
          >
            {[1, 2, 3].map((index) => (
              <span
                key={index}
                className={`text-5xl transition-all duration-300 ${
                  index <= shown
                    ? "animate-pop-in scale-110"
                    : "scale-90 opacity-20 grayscale"
                }`}
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
              className="chunky tap-target bg-grape-500 px-6 py-4 text-xl font-extrabold text-white"
              style={{ "--chunky-shade": "#4d22b4" } as React.CSSProperties}
            >
              Jogar de novo 🔁
            </button>
            <Link
              href="/kids"
              onClick={() => sfx.tap()}
              className="chunky tap-target flex items-center justify-center bg-mint-400 px-6 py-4 text-xl font-extrabold text-white"
              style={{ "--chunky-shade": "#09684d" } as React.CSSProperties}
            >
              Outros jogos 🎈
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Tempo de tela encerrado
   --------------------------------------------------------------------------- */

export function TimeUpOverlay() {
  useEffect(() => {
    sfx.goodbye();
    speak("Por hoje é só, viu? Amanhã a gente brinca mais.");
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-5">
      <div className="animate-pop-in w-full max-w-sm rounded-blob bg-cream p-7 text-center shadow-2xl">
        <div className="-mt-20 flex justify-center">
          <Hop mood="sonolento" size={110} />
        </div>
        <p className="mt-2 font-display text-2xl font-extrabold text-ink">Por hoje é só!</p>
        <p className="mt-2 text-lg text-ink-soft">
          Amanhã tem mais diversão esperando por você.
        </p>
        <Link
          href="/kids/fim"
          className="chunky tap-target mt-6 flex items-center justify-center bg-grape-500 px-6 py-4 text-xl font-extrabold text-white"
          style={{ "--chunky-shade": "#4d22b4" } as React.CSSProperties}
        >
          Tchau! 👋
        </Link>
      </div>
    </div>
  );
}
