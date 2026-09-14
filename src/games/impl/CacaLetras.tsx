"use client";

import { useCallback, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { sfx, speak } from "../sound";
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
      speak("Essa não. Escute de novo!");
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
      <div className="rounded-blob bg-white/95 p-6 text-center shadow-xl">
        <button
          type="button"
          onClick={() => {
            sfx.pop();
            speak(round.word.toLowerCase());
          }}
          className="animate-float-slow text-8xl transition active:scale-110 sm:text-9xl"
          aria-label={`Ouvir a palavra ${round.word}`}
        >
          <span aria-hidden>{round.emoji}</span>
        </button>
        <p className="mt-2 text-3xl font-extrabold tracking-widest text-ink">
          {/* A primeira letra fica oculta: é justamente o que a criança deve descobrir. */}
          <span className="text-coral-500">_</span>
          {round.word.slice(1)}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {round.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => answer(option)}
            aria-label={`Letra ${option}`}
            className={`tap-target rounded-3xl bg-white py-6 text-4xl font-extrabold text-coral-600 shadow-lg transition active:scale-95 sm:text-5xl ${
              wrongPick === option ? "animate-shake bg-coral-100" : ""
            }`}
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
