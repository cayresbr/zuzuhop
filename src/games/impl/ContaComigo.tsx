"use client";

import { useCallback, useMemo, useState } from "react";
import { Sparkles } from "@/components/scenery";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { encourage, sfx, speak } from "../sound";
import { pick, randomInt, shuffle, starsFromMistakes } from "../utils";

const THEMES = ["🚀", "🍎", "⭐", "🐠", "🎈", "🦕", "🍪", "⚽"];
const ROUNDS = 6;

interface Round {
  count: number;
  emoji: string;
  options: number[];
}

function buildRound(maxCount: number): Round {
  const count = randomInt(1, maxCount);
  const options = new Set<number>([count]);
  while (options.size < 3) {
    const candidate = randomInt(1, Math.max(maxCount, count + 2));
    if (candidate !== count) options.add(candidate);
  }
  return { count, emoji: pick(THEMES), options: shuffle([...options]) };
}

function buildRounds(): Round[] {
  // Dificuldade cresce: começa contando até 3 e termina em até 10.
  return Array.from({ length: ROUNDS }, (_, index) =>
    buildRound(Math.min(10, 3 + index * 2)),
  );
}

export default function ContaComigo() {
  const { finish } = useGameSession("conta-comigo");
  const [rounds, setRounds] = useState<Round[]>(buildRounds);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<"none" | "right" | "wrong">("none");
  const [won, setWon] = useState(false);

  const round = rounds[index]!;
  const items = useMemo(
    () => Array.from({ length: round.count }, (_, i) => i),
    [round],
  );

  const restart = useCallback(() => {
    setRounds(buildRounds());
    setIndex(0);
    setMistakes(0);
    setFeedback("none");
    setWon(false);
  }, []);

  const answer = (value: number) => {
    if (feedback === "right") return;

    if (value === round.count) {
      sfx.correct();
      speak(`${round.count}! Isso mesmo.`);
      setFeedback("right");
      window.setTimeout(() => {
        if (index < rounds.length - 1) {
          setIndex(index + 1);
          setFeedback("none");
        } else {
          setWon(true);
          void finish(rounds.length * 10, starsFromMistakes(mistakes));
        }
      }, 1100);
    } else {
      sfx.wrong();
      encourage();
      setMistakes((current) => current + 1);
      setFeedback("wrong");
      window.setTimeout(() => setFeedback("none"), 600);
    }
  };

  return (
    <GameShell
      title="Conta Comigo"
      emoji="🚀"
      color="sky"
      instruction="Conte quantos aparecem na tela e toque no número certo!"
      level={index + 1}
      totalLevels={rounds.length}
    >
      <div
        className={`relative rounded-blob bg-cream p-6 soft-shadow ${
          feedback === "wrong" ? "animate-shake" : ""
        }`}
      >
        {feedback === "right" ? <Sparkles /> : null}

        <div
          className="flex min-h-40 flex-wrap items-center justify-center gap-3"
          aria-label={`${round.count} itens para contar`}
        >
          {items.map((item) => (
            <button
              key={item}
              type="button"
              /* Tocar em cada item conta em voz alta: apoia a contagem um-a-um. */
              onClick={() => {
                sfx.pop();
                speak(String(item + 1));
              }}
              className="animate-pop-in text-5xl transition-transform duration-150 active:scale-125 sm:text-6xl"
              style={{ animationDelay: `${item * 70}ms` }}
              aria-label={`Item ${item + 1}`}
            >
              <span aria-hidden>{round.emoji}</span>
            </button>
          ))}
        </div>

        <p className="mt-3 text-center text-sm font-bold text-ink-faint">
          Toque em cada um para contar junto
        </p>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-4">
        {round.options.map((option) => {
          const isRight = feedback === "right" && option === round.count;
          return (
            <button
              key={option}
              type="button"
              onClick={() => answer(option)}
              className={`chunky chunky-card tap-target py-6 font-display text-5xl font-extrabold sm:text-6xl ${
                isRight ? "bg-mint-400 text-white" : "bg-cream text-sky-600"
              }`}
              style={
                {
                  "--chunky-shade": isRight ? "#09684d" : "#a2d6ff",
                } as React.CSSProperties
              }
            >
              {option}
            </button>
          );
        })}
      </div>

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={restart}
          message="Você é craque em contar!"
        />
      ) : null}
    </GameShell>
  );
}
