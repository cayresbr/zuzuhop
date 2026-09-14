"use client";

import { useCallback, useRef, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { sfx, speak, tone } from "../sound";
import { starsFromMistakes } from "../utils";

/**
 * Programação em blocos para pré-leitores.
 *
 * A criança monta a sequência de setas ANTES de executar e depois assiste ao
 * foguete rodar o "programa". Quando erra, a fila fica lá para ser corrigida:
 * é o ciclo escrever -> executar -> depurar, no nível dos 5 aos 8 anos.
 */

const LEVELS: string[][] = [
  ["S..", "...", "..G"],
  ["S.#.", "..#.", "....", "#..G"],
  ["S..#.", ".#...", ".#.#.", "...#.", "#...G"],
  ["S...#", "##.#.", "....#", ".##..", "#...G"],
];

type Direction = "cima" | "baixo" | "esquerda" | "direita";

const ARROWS: { dir: Direction; icon: string; dx: number; dy: number }[] = [
  { dir: "cima", icon: "⬆️", dx: 0, dy: -1 },
  { dir: "baixo", icon: "⬇️", dx: 0, dy: 1 },
  { dir: "esquerda", icon: "⬅️", dx: -1, dy: 0 },
  { dir: "direita", icon: "➡️", dx: 1, dy: 0 },
];

interface Position {
  x: number;
  y: number;
}

function findCell(grid: string[], target: string): Position {
  for (let y = 0; y < grid.length; y++) {
    const x = grid[y]!.indexOf(target);
    if (x !== -1) return { x, y };
  }
  return { x: 0, y: 0 };
}

export default function LabirintoDoFoguete() {
  const { finish } = useGameSession("labirinto-do-foguete");
  const [levelIndex, setLevelIndex] = useState(0);
  const [program, setProgram] = useState<Direction[]>([]);
  const [rocket, setRocket] = useState<Position>(() => findCell(LEVELS[0]!, "S"));
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState(false);
  const timers = useRef<number[]>([]);

  const grid = LEVELS[levelIndex]!;
  const start = findCell(grid, "S");
  const goal = findCell(grid, "G");

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const resetRocket = useCallback(() => {
    clearTimers();
    setRocket(findCell(LEVELS[levelIndex]!, "S"));
    setRunning(false);
    setCrashed(false);
  }, [levelIndex]);

  const addStep = (dir: Direction) => {
    if (running || program.length >= 12) return;
    sfx.pop();
    setProgram((current) => [...current, dir]);
  };

  const removeLast = () => {
    if (running) return;
    sfx.tap();
    setProgram((current) => current.slice(0, -1));
  };

  const isBlocked = (position: Position) =>
    position.y < 0 ||
    position.y >= grid.length ||
    position.x < 0 ||
    position.x >= grid[position.y]!.length ||
    grid[position.y]![position.x] === "#";

  const run = () => {
    if (running || program.length === 0) return;
    setRunning(true);
    setCrashed(false);
    clearTimers();

    let current = { ...start };
    let failed = false;

    program.forEach((dir, step) => {
      timers.current.push(
        window.setTimeout(
          () => {
            if (failed) return;
            const arrow = ARROWS.find((item) => item.dir === dir)!;
            const next = { x: current.x + arrow.dx, y: current.y + arrow.dy };

            if (isBlocked(next)) {
              failed = true;
              sfx.wrong();
              speak("Ops! Bateu. Vamos arrumar o caminho.");
              setCrashed(true);
              setMistakes((value) => value + 1);
              setRunning(false);
              return;
            }

            current = next;
            setRocket(next);
            tone({ frequency: 440 + step * 40, durationMs: 110, type: "triangle" });

            const isLastStep = step === program.length - 1;
            const reachedGoal = next.x === goal.x && next.y === goal.y;

            if (reachedGoal) {
              window.setTimeout(() => {
                if (levelIndex < LEVELS.length - 1) {
                  sfx.correct();
                  speak("Chegou! Próximo planeta.");
                  setLevelIndex(levelIndex + 1);
                  setProgram([]);
                  setRocket(findCell(LEVELS[levelIndex + 1]!, "S"));
                  setRunning(false);
                } else {
                  setWon(true);
                  setRunning(false);
                  void finish((levelIndex + 1) * 30, starsFromMistakes(mistakes));
                }
              }, 400);
            } else if (isLastStep) {
              sfx.wrong();
              speak("Faltou pouco! Acrescente mais setas.");
              setMistakes((value) => value + 1);
              setRunning(false);
            }
          },
          (step + 1) * 520,
        ),
      );
    });
  };

  const restart = useCallback(() => {
    clearTimers();
    setLevelIndex(0);
    setProgram([]);
    setRocket(findCell(LEVELS[0]!, "S"));
    setMistakes(0);
    setWon(false);
    setRunning(false);
  }, []);

  return (
    <GameShell
      title="Labirinto do Foguete"
      emoji="🛸"
      color="sky"
      instruction="Monte o caminho com as setinhas e toque em jogar para o foguete voar!"
      level={levelIndex + 1}
      totalLevels={LEVELS.length}
    >
      <div className="rounded-blob bg-white/95 p-4 shadow-xl">
        <div
          className="mx-auto grid w-fit gap-1"
          style={{ gridTemplateColumns: `repeat(${grid[0]!.length}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`Labirinto ${levelIndex + 1}. Foguete na linha ${rocket.y + 1}, coluna ${rocket.x + 1}.`}
        >
          {grid.flatMap((row, y) =>
            row.split("").map((cell, x) => {
              const hasRocket = rocket.x === x && rocket.y === y;
              const isGoal = cell === "G";
              const isWall = cell === "#";
              return (
                <div
                  key={`${x}-${y}`}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl sm:h-20 sm:w-20 sm:text-4xl ${
                    isWall ? "bg-ink/80" : "bg-sky-100"
                  } ${hasRocket && crashed ? "animate-shake" : ""}`}
                >
                  <span aria-hidden>
                    {hasRocket ? "🚀" : isGoal ? "🪐" : isWall ? "☄️" : ""}
                  </span>
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-4 min-h-20 rounded-blob bg-white/95 p-4 shadow-lg">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-ink-soft">
          Seu programa
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {program.length === 0 ? (
            <span className="text-lg text-ink-soft">Toque nas setas abaixo 👇</span>
          ) : (
            program.map((dir, position) => (
              <span
                key={`${dir}-${position}`}
                className="animate-pop-in rounded-2xl bg-sky-100 px-3 py-2 text-3xl"
                aria-label={`Passo ${position + 1}: ${dir}`}
              >
                <span aria-hidden>
                  {ARROWS.find((item) => item.dir === dir)!.icon}
                </span>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {ARROWS.map((arrow) => (
          <button
            key={arrow.dir}
            type="button"
            onClick={() => addStep(arrow.dir)}
            disabled={running}
            aria-label={`Andar para ${arrow.dir}`}
            className="tap-target rounded-3xl bg-white px-5 py-4 text-4xl shadow-lg transition active:scale-90 disabled:opacity-50"
          >
            <span aria-hidden>{arrow.icon}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3 pb-6">
        <button
          type="button"
          onClick={run}
          disabled={running || program.length === 0}
          className="tap-target rounded-full bg-mint-500 px-7 py-4 text-xl font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          Jogar ▶️
        </button>
        <button
          type="button"
          onClick={removeLast}
          disabled={running}
          className="tap-target rounded-full bg-mango-400 px-7 py-4 text-xl font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          Apagar ↩️
        </button>
        <button
          type="button"
          onClick={() => {
            setProgram([]);
            resetRocket();
            sfx.tap();
          }}
          className="tap-target rounded-full bg-coral-500 px-7 py-4 text-xl font-bold text-white shadow-lg transition active:scale-95"
        >
          Recomeçar 🔁
        </button>
      </div>

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={restart}
          message="Você programou o foguete!"
        />
      ) : null}
    </GameShell>
  );
}
