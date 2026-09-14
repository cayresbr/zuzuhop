"use client";

import { useCallback, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { sfx, speak } from "../sound";
import { shuffle, starsFromMistakes } from "../utils";

/**
 * Aprendizagem socioemocional: associar situação -> emoção -> nome da emoção.
 * Sem "resposta errada humilhante": o erro vira convite para olhar de novo.
 */

const SCENES = [
  {
    situation: "O sorvete da Ana caiu no chão.",
    emoji: "😢",
    emotion: "triste",
    tip: "Quando a gente fica triste, pode pedir um abraço.",
  },
  {
    situation: "O Téo ganhou um presente surpresa!",
    emoji: "🤩",
    emotion: "animado",
    tip: "Ficar animado dá vontade de pular!",
  },
  {
    situation: "Alguém pegou o brinquedo do Léo sem pedir.",
    emoji: "😠",
    emotion: "bravo",
    tip: "Quando eu fico bravo, respiro fundo três vezes.",
  },
  {
    situation: "A Mel vai dormir fora de casa pela primeira vez.",
    emoji: "😰",
    emotion: "com medo",
    tip: "Contar o medo para um adulto deixa ele menorzinho.",
  },
  {
    situation: "O Bento fez sozinho um castelo enorme.",
    emoji: "😄",
    emotion: "orgulhoso",
    tip: "Dá gosto conseguir uma coisa difícil!",
  },
  {
    situation: "A Dani esperou muito tempo na fila.",
    emoji: "😑",
    emotion: "impaciente",
    tip: "Cantar uma música ajuda a esperar.",
  },
  {
    situation: "O Ravi derrubou o suco do amigo sem querer.",
    emoji: "😳",
    emotion: "envergonhado",
    tip: "Pedir desculpa resolve quase tudo.",
  },
  {
    situation: "A Zuzu ganhou um abraço bem apertado.",
    emoji: "🥰",
    emotion: "querido",
    tip: "Sentir-se querido aquece o coração.",
  },
];

const ROUNDS = 5;

interface Round {
  situation: string;
  emoji: string;
  emotion: string;
  tip: string;
  options: { emoji: string; emotion: string }[];
}

function buildRounds(): Round[] {
  const chosen = shuffle(SCENES).slice(0, ROUNDS);
  return chosen.map((scene) => {
    const distractors = shuffle(
      SCENES.filter((item) => item.emotion !== scene.emotion),
    ).slice(0, 2);
    return {
      ...scene,
      options: shuffle(
        [scene, ...distractors].map((item) => ({
          emoji: item.emoji,
          emotion: item.emotion,
        })),
      ),
    };
  });
}

export default function ComoEuMeSinto() {
  const { finish } = useGameSession("como-eu-me-sinto");
  const [rounds, setRounds] = useState<Round[]>(buildRounds);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [won, setWon] = useState(false);

  const round = rounds[index]!;

  const restart = useCallback(() => {
    setRounds(buildRounds());
    setIndex(0);
    setMistakes(0);
    setRevealed(false);
    setWon(false);
  }, []);

  const answer = (emotion: string) => {
    if (revealed) return;
    if (emotion === round.emotion) {
      sfx.correct();
      setRevealed(true);
      speak(`${round.emotion}. ${round.tip}`);
      window.setTimeout(() => {
        if (index < rounds.length - 1) {
          setIndex(index + 1);
          setRevealed(false);
        } else {
          setWon(true);
          void finish(rounds.length * 10, starsFromMistakes(mistakes));
        }
      }, 3200);
    } else {
      sfx.wrong();
      speak("Hum... olhe o rostinho de novo.");
      setMistakes((current) => current + 1);
    }
  };

  return (
    <GameShell
      title="Como Eu Me Sinto"
      emoji="💛"
      color="coral"
      instruction="Escute a história e escolha como o amiguinho está se sentindo."
      level={index + 1}
      totalLevels={rounds.length}
    >
      <div className="rounded-blob bg-white/95 p-6 text-center shadow-xl">
        <button
          type="button"
          onClick={() => {
            sfx.pop();
            speak(round.situation);
          }}
          className="text-lg font-bold text-ink sm:text-2xl"
          aria-label="Ouvir a história de novo"
        >
          {round.situation} 🔊
        </button>

        {revealed ? (
          <div className="animate-pop-in mt-5">
            <div className="text-7xl" aria-hidden>
              {round.emoji}
            </div>
            <p className="mt-2 text-2xl font-extrabold capitalize text-coral-600">
              {round.emotion}
            </p>
            <p className="mt-2 text-lg text-ink-soft">{round.tip}</p>
          </div>
        ) : (
          <div className="mt-5 text-7xl opacity-30" aria-hidden>
            ❔
          </div>
        )}
      </div>

      {!revealed ? (
        <div className="mt-6 grid grid-cols-3 gap-4">
          {round.options.map((option) => (
            <button
              key={option.emotion}
              type="button"
              onClick={() => answer(option.emotion)}
              className="tap-target flex flex-col items-center gap-1 rounded-3xl bg-white py-5 shadow-lg transition active:scale-95"
            >
              <span className="text-5xl sm:text-6xl" aria-hidden>
                {option.emoji}
              </span>
              <span className="text-base font-bold capitalize text-ink-soft">
                {option.emotion}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={restart}
          message="Você entende os sentimentos!"
        />
      ) : null}
    </GameShell>
  );
}
