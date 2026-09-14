"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { NOTES, encourage, nextLevel, sfx, speak, tone } from "../sound";
import { randomInt, starsFromMistakes } from "../utils";

/** Versão infantil do "Genius": escute a sequência e repita. */

const KEYS = [
  { id: 0, note: NOTES.do, label: "dó", className: "bg-coral-500", shade: "#9c1d1d", emoji: "🍓" },
  { id: 1, note: NOTES.re, label: "ré", className: "bg-mango-400", shade: "#9c5203", emoji: "🍌" },
  { id: 2, note: NOTES.mi, label: "mi", className: "bg-mint-500", shade: "#09684d", emoji: "🥝" },
  { id: 3, note: NOTES.fa, label: "fá", className: "bg-sky-500", shade: "#0e4c8a", emoji: "🫐" },
  { id: 4, note: NOTES.sol, label: "sol", className: "bg-grape-500", shade: "#4d22b4", emoji: "🍇" },
] as const;

const MAX_ROUNDS = 6;

export default function PianoMaluco() {
  const { finish } = useGameSession("piano-maluco");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "showing" | "playing">("idle");
  const [mistakes, setMistakes] = useState(0);
  const [freePlay, setFreePlay] = useState(false);
  const [won, setWon] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const showSequence = useCallback((notes: number[]) => {
    setPhase("showing");
    clearTimers();
    notes.forEach((keyId, position) => {
      timers.current.push(
        window.setTimeout(() => {
          const key = KEYS[keyId]!;
          setHighlight(keyId);
          tone({ frequency: key.note, durationMs: 380, type: "triangle" });
          timers.current.push(window.setTimeout(() => setHighlight(null), 340));
        }, position * 620),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setPhase("playing");
        setPlayerIndex(0);
      }, notes.length * 620 + 200),
    );
  }, []);

  const nextRound = useCallback(
    (current: number[]) => {
      const grown = [...current, randomInt(0, KEYS.length - 1)];
      setSequence(grown);
      window.setTimeout(() => showSequence(grown), 700);
    },
    [showSequence],
  );

  const start = useCallback(() => {
    setMistakes(0);
    setWon(false);
    setFreePlay(false);
    nextRound([]);
  }, [nextRound]);

  const pressKey = (keyId: number) => {
    const key = KEYS[keyId]!;
    tone({ frequency: key.note, durationMs: 320, type: "triangle" });
    setHighlight(keyId);
    window.setTimeout(() => setHighlight(null), 220);

    if (freePlay || phase !== "playing") return;

    if (sequence[playerIndex] === keyId) {
      const nextIndex = playerIndex + 1;
      if (nextIndex < sequence.length) {
        setPlayerIndex(nextIndex);
        return;
      }
      // Sequência completa.
      if (sequence.length >= MAX_ROUNDS) {
        setPhase("idle");
        setWon(true);
        void finish(sequence.length * 20, starsFromMistakes(mistakes));
      } else {
        sfx.levelUp();
        nextLevel();
        setPhase("idle");
        window.setTimeout(() => nextRound(sequence), 900);
      }
    } else {
      sfx.wrong();
      encourage();
      setMistakes((current) => current + 1);
      setPhase("idle");
      window.setTimeout(() => showSequence(sequence), 900);
    }
  };

  return (
    <GameShell
      title="Piano Maluco"
      emoji="🎹"
      color="mint"
      instruction="Escute a musiquinha e repita tocando nas teclas coloridas!"
      level={Math.max(1, sequence.length)}
      totalLevels={MAX_ROUNDS}
    >
      <div className="rounded-blob bg-cream p-4 soft-shadow">
        <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-ink-faint">
          {phase === "showing"
            ? "Escutando... preste atenção!"
            : freePlay
              ? "Toque livre — faça a sua música"
              : phase === "playing"
                ? "Agora é a sua vez"
                : "Toque em começar"}
        </p>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {KEYS.map((key) => {
            const lit = highlight === key.id;
            return (
              <button
                key={key.id}
                type="button"
                onClick={() => pressKey(key.id)}
                disabled={phase === "showing"}
                aria-label={`Tecla ${key.label}`}
                className={`chunky chunky-card glossy tap-target relative flex h-44 flex-col items-center justify-end gap-2 overflow-hidden ${key.className} pb-4 text-white disabled:opacity-80 sm:h-60 ${
                  lit ? "scale-105 brightness-125 saturate-150" : ""
                }`}
                style={{ "--chunky-shade": key.shade } as React.CSSProperties}
              >
                {/* Halo que acende quando a tecla toca */}
                {lit ? (
                  <span className="absolute inset-0 animate-pop-in bg-white/35" aria-hidden />
                ) : null}
                <span className="relative text-4xl sm:text-5xl" aria-hidden>
                  {key.emoji}
                </span>
                <span className="relative font-display text-lg font-extrabold">
                  {key.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            sfx.tap();
            start();
          }}
          className="chunky tap-target bg-cream px-7 py-4 text-xl font-extrabold text-mint-700"
          style={{ "--chunky-shade": "#8bf0cd" } as React.CSSProperties}
        >
          {sequence.length === 0 ? "Começar 🎵" : "Recomeçar 🔁"}
        </button>
        <button
          type="button"
          onClick={() => {
            sfx.tap();
            clearTimers();
            setPhase("idle");
            setFreePlay((value) => !value);
            speak(freePlay ? "Modo desafio!" : "Toque livre! Faça a sua música.");
          }}
          aria-pressed={freePlay}
          className={`chunky tap-target px-7 py-4 text-xl font-extrabold ${
            freePlay ? "bg-mango-400 text-white" : "bg-cream text-mint-700"
          }`}
          style={
            {
              "--chunky-shade": freePlay ? "#9c5203" : "#8bf0cd",
            } as React.CSSProperties
          }
        >
          Toque livre 🎶
        </button>
      </div>

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={start}
          message="Que ouvido musical!"
        />
      ) : null}
    </GameShell>
  );
}
