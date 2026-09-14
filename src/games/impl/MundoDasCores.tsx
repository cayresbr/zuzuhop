"use client";

import { useCallback, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { encourage, sfx, speak } from "../sound";
import { shuffle, starsFromMistakes } from "../utils";

/**
 * Classificação por cor. Usa "tocar e colocar" em vez de arrastar:
 * drag-and-drop é pouco confiável com dedos pequenos em telas de toque.
 */

const BUCKETS = [
  { id: "vermelho", label: "vermelho", className: "bg-coral-500", shade: "#9c1d1d" },
  { id: "azul", label: "azul", className: "bg-sky-500", shade: "#0e4c8a" },
  { id: "amarelo", label: "amarelo", className: "bg-mango-400", shade: "#9c5203" },
  { id: "verde", label: "verde", className: "bg-mint-500", shade: "#09684d" },
] as const;

type BucketId = (typeof BUCKETS)[number]["id"];

const ITEMS: { emoji: string; color: BucketId; name: string }[] = [
  { emoji: "🍎", color: "vermelho", name: "maçã" },
  { emoji: "🍓", color: "vermelho", name: "morango" },
  { emoji: "🚗", color: "vermelho", name: "carrinho" },
  { emoji: "🐞", color: "vermelho", name: "joaninha" },
  { emoji: "🫐", color: "azul", name: "mirtilo" },
  { emoji: "🐳", color: "azul", name: "baleia" },
  { emoji: "🧢", color: "azul", name: "boné" },
  { emoji: "💧", color: "azul", name: "gotinha" },
  { emoji: "🍋", color: "amarelo", name: "limão" },
  { emoji: "🌟", color: "amarelo", name: "estrela" },
  { emoji: "🐥", color: "amarelo", name: "pintinho" },
  { emoji: "🌻", color: "amarelo", name: "girassol" },
  { emoji: "🥦", color: "verde", name: "brócolis" },
  { emoji: "🐢", color: "verde", name: "tartaruga" },
  { emoji: "🌳", color: "verde", name: "árvore" },
  { emoji: "🐸", color: "verde", name: "sapo" },
];

const ROUND_SIZE = 8;

interface Piece {
  id: number;
  emoji: string;
  color: BucketId;
  name: string;
  placed: boolean;
}

function buildPieces(): Piece[] {
  return shuffle(ITEMS)
    .slice(0, ROUND_SIZE)
    .map((item, index) => ({ ...item, id: index, placed: false }));
}

export default function MundoDasCores() {
  const { finish } = useGameSession("mundo-das-cores");
  const [pieces, setPieces] = useState<Piece[]>(buildPieces);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrongBucket, setWrongBucket] = useState<BucketId | null>(null);
  const [won, setWon] = useState(false);

  const remaining = pieces.filter((piece) => !piece.placed);

  const restart = useCallback(() => {
    setPieces(buildPieces());
    setSelected(null);
    setMistakes(0);
    setWon(false);
  }, []);

  const selectPiece = (id: number) => {
    sfx.pop();
    setSelected(id);
    const piece = pieces.find((item) => item.id === id);
    if (piece) speak(piece.name);
  };

  const dropInto = (bucket: BucketId) => {
    if (selected === null) {
      speak("Escolha primeiro uma figura.");
      sfx.tap();
      return;
    }
    const piece = pieces.find((item) => item.id === selected);
    if (!piece) return;

    if (piece.color === bucket) {
      sfx.correct();
      // Repetir "morango vermelho" liga o objeto ao nome da cor.
      speak(`${piece.name} ${bucket}!`);
      const updated = pieces.map((item) =>
        item.id === piece.id ? { ...item, placed: true } : item,
      );
      setPieces(updated);
      setSelected(null);

      if (updated.every((item) => item.placed)) {
        window.setTimeout(() => {
          setWon(true);
          void finish(ROUND_SIZE * 10, starsFromMistakes(mistakes));
        }, 500);
      }
    } else {
      sfx.wrong();
      encourage();
      setMistakes((current) => current + 1);
      setWrongBucket(bucket);
      window.setTimeout(() => setWrongBucket(null), 500);
    }
  };

  return (
    <GameShell
      title="Mundo das Cores"
      emoji="🎨"
      color="grape"
      instruction="Toque numa figura e depois no balde da cor dela!"
    >
      <div className="rounded-blob bg-cream p-5 soft-shadow">
        <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-ink-faint">
          {selected === null ? "Escolha uma figura" : "Agora toque no balde da cor"}
        </p>

        <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
          {remaining.map((piece) => (
            <button
              key={piece.id}
              type="button"
              onClick={() => selectPiece(piece.id)}
              aria-label={piece.name}
              aria-pressed={selected === piece.id}
              className={`tap-target rounded-3xl p-2 text-5xl transition-all duration-150 sm:text-6xl ${
                selected === piece.id
                  ? "animate-wiggle scale-110 bg-grape-100 ring-4 ring-grape-500"
                  : "hover:scale-105 active:scale-95"
              }`}
            >
              <span aria-hidden>{piece.emoji}</span>
            </button>
          ))}
          {remaining.length === 0 ? (
            <p className="font-display text-2xl font-extrabold text-mint-600">
              Tudo organizado! 🎉
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {BUCKETS.map((bucket) => (
          <button
            key={bucket.id}
            type="button"
            onClick={() => dropInto(bucket.id)}
            aria-label={`Balde ${bucket.label}`}
            className={`chunky chunky-card glossy tap-target relative flex flex-col items-center gap-1 overflow-hidden ${bucket.className} px-3 py-5 text-white ${
              wrongBucket === bucket.id ? "animate-shake" : ""
            } ${selected !== null ? "ring-4 ring-white/70" : ""}`}
            style={{ "--chunky-shade": bucket.shade } as React.CSSProperties}
          >
            {/* Balde desenhado: trapézio + alça, em vez de emoji genérico */}
            <svg viewBox="0 0 64 56" width="58" height="50" aria-hidden="true">
              <path
                d="M 8 4 q 24 -10 48 0"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 6 10 h 52 l -7 42 a 4 4 0 0 1 -4 3 h -30 a 4 4 0 0 1 -4 -3 z"
                fill="rgba(255,255,255,0.95)"
              />
              <rect x="4" y="8" width="56" height="9" rx="4.5" fill="#ffffff" />
            </svg>
            <span className="font-display text-lg font-extrabold capitalize">
              {bucket.label}
            </span>
          </button>
        ))}
      </div>

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={restart}
          message="Você separou todas as cores!"
        />
      ) : null}
    </GameShell>
  );
}
