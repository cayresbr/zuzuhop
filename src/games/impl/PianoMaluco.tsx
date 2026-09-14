"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { NOTES, sfx, speak, tone } from "../sound";
import { randomInt, starsFromMistakes } from "../utils";

/** Versão infantil do "Genius": escute a sequência e repita. */

const KEYS = [
  { id: 0, note: NOTES.do, label: "dó", className: "bg-coral-500", emoji: "🍓" },
  { id: 1, note: NOTES.re, label: "ré", className: "bg-mango-400", emoji: "🍌" },
  { id: 2, note: NOTES.mi, label: "mi", className: "bg-mint-500", emoji: "🥝" },
  { id: 3, note: NOTES.fa, label: "fá", className: "bg-sky-500", emoji: "🫐" },
  { id: 4, note: NOTES.sol, label: "sol", className: "bg-grape-500", emoji: "🍇" },
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
        sfx.correct();
        speak("Boa! Agora ficou maior.");
        setPhase("idle");
        window.setTimeout(() => nextRound(sequence), 900);
      }
    } else {
      sfx.wrong();
      speak("Quase! Escute de novo.");
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
      <div className="rounded-blob bg-white/95 p-4 shadow-xl">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {KEYS.map((key) => (
            <button
              key={key.id}
              type="button"
              onClick={() => pressKey(key.id)}
              disabled={phase === "showing"}
              aria-label={`Tecla ${key.label}`}
              className={`tap-target flex h-40 flex-col items-center justify-end gap-2 rounded-3xl ${key.className} pb-4 text-white shadow-lg transition disabled:opacity-70 sm:h-56 ${
                highlight === key.id ? "scale-105 brightness-125" : "active:scale-95"
              }`}
            >
              <span className="text-4xl sm:text-5xl" aria-hidden>
                {key.emoji}
              </span>
              <span className="text-lg font-bold">{key.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            sfx.tap();
            start();
          }}
          className="tap-target rounded-full bg-white px-6 py-4 text-xl font-bold text-mint-600 shadow-lg transition active:scale-95"
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
            speak(freePlay ? "Modo desafio" : "Toque livre! Faça sua música.");
          }}
          className={`tap-target rounded-full px-6 py-4 text-xl font-bold shadow-lg transition active:scale-95 ${
            freePlay ? "bg-mango-400 text-white" : "bg-white text-mint-600"
          }`}
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
