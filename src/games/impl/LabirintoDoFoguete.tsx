"use client";

import { useCallback, useRef, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { encourage, nextLevel, sfx, speak, tone } from "../sound";
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
              speak("Ops, bateu! Vamos arrumar o caminho.");
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
                  sfx.levelUp();
                  nextLevel();
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
              encourage();
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
      {/* Tabuleiro: céu estrelado, para o foguete ter onde voar */}
      <div className="relative overflow-hidden rounded-blob bg-gradient-to-b from-[#1d1740] to-grape-700 p-4 soft-shadow">
        <span className="dots pointer-events-none absolute inset-0 opacity-25" aria-hidden />

        <div
          className="relative mx-auto grid w-fit gap-1.5"
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
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-all duration-300 sm:h-20 sm:w-20 sm:text-4xl ${
                    isWall
                      ? "bg-coral-600/80"
                      : isGoal
                        ? "bg-mint-400/30 ring-2 ring-mint-300"
                        : "bg-white/10"
                  } ${hasRocket && crashed ? "animate-shake" : ""}`}
                >
                  <span
                    className={hasRocket ? "animate-pop-in" : isGoal ? "animate-breathe" : ""}
                    aria-hidden
                  >
                    {hasRocket ? "🚀" : isGoal ? "🪐" : isWall ? "☄️" : ""}
                  </span>
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Fila de comandos montada pela criança */}
      <div className="mt-4 min-h-24 rounded-blob bg-cream p-4 soft-shadow">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-ink-faint">
          Seu programa
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {program.length === 0 ? (
            <span className="text-lg font-bold text-ink-faint">
              Toque nas setas aqui embaixo 👇
            </span>
          ) : (
            program.map((dir, position) => (
              <span
                key={`${dir}-${position}`}
                className="animate-pop-in flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl ring-2 ring-sky-200"
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
            className="chunky chunky-card tap-target bg-cream px-5 py-4 text-4xl disabled:opacity-50"
            style={{ "--chunky-shade": "#a2d6ff" } as React.CSSProperties}
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
          className="chunky tap-target bg-mint-500 px-7 py-4 text-xl font-extrabold text-white disabled:opacity-50"
          style={{ "--chunky-shade": "#09684d" } as React.CSSProperties}
        >
          {running ? "Voando..." : "Jogar ▶️"}
        </button>
        <button
          type="button"
          onClick={removeLast}
          disabled={running}
          className="chunky tap-target bg-mango-400 px-7 py-4 text-xl font-extrabold text-white disabled:opacity-50"
          style={{ "--chunky-shade": "#9c5203" } as React.CSSProperties}
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
          className="chunky tap-target bg-coral-500 px-7 py-4 text-xl font-extrabold text-white"
          style={{ "--chunky-shade": "#9c1d1d" } as React.CSSProperties}
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
