"use client";

import { useCallback, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { encourage, sfx, speak } from "../sound";
import { pick, shuffle, starsFromMistakes } from "../utils";

/** Padrões ABAB / AABB / ABC — base do pensamento algorítmico. */

const SETS = [
  ["🍎", "🍌", "🍇"],
  ["🔺", "🟦", "🟡"],
  ["🐶", "🐱", "🐭"],
  ["🚗", "🚌", "🚲"],
  ["🌞", "🌙", "⭐"],
];

// Cada padrão é uma lista de índices no conjunto de figuras.
// Mostramos as 5 primeiras posições; a 6ª é a resposta.
const PATTERNS: number[][] = [
  [0, 1, 0, 1, 0, 1], // AB
  [0, 0, 1, 0, 0, 1], // AAB
  [0, 1, 2, 0, 1, 2], // ABC
  [0, 1, 1, 0, 1, 1], // ABB
];

const ROUNDS = 6;

interface Round {
  visible: string[];
  answer: string;
  options: string[];
}

function buildRound(): Round {
  const set = shuffle(pick(SETS));
  const pattern = pick(PATTERNS);
  const rendered = pattern.map((position) => set[position]!);
  const answer = rendered[rendered.length - 1]!;
  const distractors = set.filter((item) => item !== answer).slice(0, 2);

  return {
    visible: rendered.slice(0, rendered.length - 1),
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

function buildRounds(): Round[] {
  return Array.from({ length: ROUNDS }, buildRound);
}

export default function SequenciaMagica() {
  const { finish } = useGameSession("sequencia-magica");
  const [rounds, setRounds] = useState<Round[]>(buildRounds);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const round = rounds[index]!;

  const restart = useCallback(() => {
    setRounds(buildRounds());
    setIndex(0);
    setMistakes(0);
    setSolved(false);
    setWon(false);
  }, []);

  const answer = (option: string) => {
    if (solved) return;
    if (option === round.answer) {
      sfx.correct();
      speak("Isso! Você descobriu o segredo.");
      setSolved(true);
      window.setTimeout(() => {
        if (index < rounds.length - 1) {
          setIndex(index + 1);
          setSolved(false);
        } else {
          setWon(true);
          void finish(rounds.length * 10, starsFromMistakes(mistakes));
        }
      }, 1200);
    } else {
      sfx.wrong();
      encourage();
      setMistakes((current) => current + 1);
      setWrongPick(option);
      window.setTimeout(() => setWrongPick(null), 600);
    }
  };

  return (
    <GameShell
      title="Sequência Mágica"
      emoji="🔮"
      color="grape"
      instruction="Olhe a ordem das figuras e descubra qual vem depois!"
      level={index + 1}
      totalLevels={rounds.length}
    >
      <div className="rounded-blob bg-cream p-6 soft-shadow">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {round.visible.map((item, position) => (
            <span
              key={`${item}-${position}`}
              className="animate-pop-in flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl bg-grape-50 text-5xl sm:h-24 sm:w-24 sm:text-6xl"
              style={{ animationDelay: `${position * 100}ms` }}
              aria-hidden
            >
              {item}
            </span>
          ))}

          {/* Seta de continuidade: deixa claro que a sequência segue */}
          <span className="text-3xl text-grape-300" aria-hidden>
            →
          </span>

          <span
            className={`flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl border-4 border-dashed text-5xl transition-colors sm:h-24 sm:w-24 sm:text-6xl ${
              solved
                ? "animate-pop-in border-mint-400 bg-mint-100"
                : "border-grape-300 bg-white"
            }`}
            aria-label={solved ? "Resposta correta" : "Peça que falta"}
          >
            {solved ? round.answer : "❔"}
          </span>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-4">
        {round.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => answer(option)}
            className={`chunky chunky-card tap-target py-6 text-5xl sm:text-6xl ${
              wrongPick === option ? "animate-shake bg-coral-100" : "bg-cream"
            }`}
            style={{ "--chunky-shade": "#d6c5ff" } as React.CSSProperties}
            aria-label={`Escolher ${option}`}
          >
            <span aria-hidden>{option}</span>
          </button>
        ))}
      </div>

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={restart}
          message="Você decifrou todos os padrões!"
        />
      ) : null}
    </GameShell>
  );
}
