"use client";

import { useCallback, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { encourage, sfx, speak } from "../sound";
import { shuffle, starsFromMistakes } from "../utils";

const WORDS = [
  { word: "ABELHA", emoji: "🐝" },
  { word: "BOLA", emoji: "⚽" },
  { word: "CACHORRO", emoji: "🐶" },
  { word: "DINOSSAURO", emoji: "🦕" },
  { word: "ELEFANTE", emoji: "🐘" },
  { word: "FOGUETE", emoji: "🚀" },
  { word: "GATO", emoji: "🐱" },
  { word: "IGREJA", emoji: "⛪" },
  { word: "LUA", emoji: "🌙" },
  { word: "MACACO", emoji: "🐵" },
  { word: "NAVIO", emoji: "🚢" },
  { word: "PIZZA", emoji: "🍕" },
  { word: "ROBO", emoji: "🤖" },
  { word: "SOL", emoji: "☀️" },
  { word: "TREM", emoji: "🚂" },
  { word: "UVA", emoji: "🍇" },
];

const ALPHABET = "ABCDEFGHIJLMNOPQRSTUVXZ".split("");
const ROUNDS = 6;

interface Round {
  word: string;
  emoji: string;
  letter: string;
  options: string[];
}

function buildRounds(): Round[] {
  return shuffle(WORDS)
    .slice(0, ROUNDS)
    .map((entry) => {
      const letter = entry.word[0]!;
      const distractors = shuffle(ALPHABET.filter((item) => item !== letter)).slice(
        0,
        3,
      );
      return {
        word: entry.word,
        emoji: entry.emoji,
        letter,
        options: shuffle([letter, ...distractors]),
      };
    });
}

export default function CacaLetras() {
  const { finish } = useGameSession("caca-letras");
  const [rounds, setRounds] = useState<Round[]>(buildRounds);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const round = rounds[index]!;

  const restart = useCallback(() => {
    setRounds(buildRounds());
    setIndex(0);
    setMistakes(0);
    setWrongPick(null);
    setWon(false);
  }, []);

  const answer = (letter: string) => {
    if (letter === round.letter) {
      sfx.correct();
      speak(`${round.letter} de ${round.word.toLowerCase()}`);
      window.setTimeout(() => {
        if (index < rounds.length - 1) {
          setIndex(index + 1);
          setWrongPick(null);
        } else {
          setWon(true);
          void finish(rounds.length * 10, starsFromMistakes(mistakes));
        }
      }, 1400);
    } else {
      sfx.wrong();
      encourage();
      setMistakes((current) => current + 1);
      setWrongPick(letter);
      window.setTimeout(() => setWrongPick(null), 600);
    }
  };

  return (
    <GameShell
      title="Caça-Letras"
      emoji="🅰️"
      color="coral"
      instruction="Com que letra começa a palavra? Toque na letrinha certa!"
      level={index + 1}
      totalLevels={rounds.length}
    >
      <div className="rounded-blob bg-cream p-6 text-center soft-shadow">
        <button
          type="button"
          onClick={() => {
            sfx.pop();
            speak(round.word.toLowerCase());
          }}
          className="animate-float-slow text-8xl transition-transform duration-150 active:scale-110 sm:text-9xl"
          aria-label={`Ouvir a palavra ${round.word}`}
        >
          <span aria-hidden>{round.emoji}</span>
        </button>

        <p className="mt-3 flex items-center justify-center gap-1 font-display text-3xl font-extrabold tracking-[0.12em] text-ink sm:text-4xl">
          {/* A primeira letra fica oculta: é o que a criança deve descobrir. */}
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-dashed border-coral-300 text-coral-500">
            ?
          </span>
          {round.word.slice(1)}
        </p>

        <p className="mt-2 text-sm font-bold text-ink-faint">
          Toque na figura para ouvir a palavra
        </p>
      </div>

      <div className="mt-7 grid grid-cols-4 gap-3">
        {round.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => answer(option)}
            aria-label={`Letra ${option}`}
            className={`chunky chunky-card tap-target py-6 font-display text-4xl font-extrabold text-coral-600 sm:text-5xl ${
              wrongPick === option ? "animate-shake bg-coral-100" : "bg-cream"
            }`}
            style={{ "--chunky-shade": "#ffb8b8" } as React.CSSProperties}
          >
            {option}
          </button>
        ))}
      </div>

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={restart}
          message="Você achou todas as letras!"
        />
      ) : null}
    </GameShell>
  );
}
