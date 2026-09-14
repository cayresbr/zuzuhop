"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { encourage, nextLevel, sfx, speak } from "../sound";
import { shuffle, starsFromMistakes } from "../utils";

const ANIMALS = [
  { emoji: "🦁", name: "leão" },
  { emoji: "🐘", name: "elefante" },
  { emoji: "🐙", name: "polvo" },
  { emoji: "🦖", name: "dinossauro" },
  { emoji: "🦊", name: "raposa" },
  { emoji: "🐬", name: "golfinho" },
  { emoji: "🦉", name: "coruja" },
  { emoji: "🐸", name: "sapo" },
];

// Fases progressivas: 3 pares -> 4 -> 6 -> 8.
const LEVELS = [3, 4, 6, 8];

interface Card {
  id: number;
  emoji: string;
  name: string;
  matched: boolean;
}

function buildDeck(pairCount: number): Card[] {
  const chosen = shuffle(ANIMALS).slice(0, pairCount);
  const doubled = chosen.flatMap((animal) => [animal, animal]);
  return shuffle(doubled).map((animal, index) => ({
    id: index,
    emoji: animal.emoji,
    name: animal.name,
    matched: false,
  }));
}

export default function MemoriaDosBichos() {
  const { finish } = useGameSession("memoria-dos-bichos");
  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState<Card[]>(() => buildDeck(LEVELS[0]!));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState(false);

  const startLevel = useCallback((levelIndex: number) => {
    setCards(buildDeck(LEVELS[levelIndex]!));
    setFlipped([]);
    setLocked(false);
    setWon(false);
  }, []);

  const restart = useCallback(() => {
    setLevel(0);
    setMistakes(0);
    startLevel(0);
  }, [startLevel]);

  const handleFlip = (cardId: number) => {
    if (locked || won) return;
    const card = cards.find((item) => item.id === cardId);
    if (!card || card.matched || flipped.includes(cardId)) return;

    sfx.pop();
    const next = [...flipped, cardId];
    setFlipped(next);

    if (next.length < 2) return;

    setLocked(true);
    const [firstId, secondId] = next;
    const first = cards.find((item) => item.id === firstId)!;
    const second = cards.find((item) => item.id === secondId)!;

    if (first.emoji === second.emoji) {
      window.setTimeout(() => {
        setCards((current) =>
          current.map((item) =>
            item.emoji === first.emoji ? { ...item, matched: true } : item,
          ),
        );
        setFlipped([]);
        setLocked(false);
        sfx.correct();
        // Nomear o bicho encontrado transforma o acerto em vocabulário.
        speak(`${first.name}!`);
      }, 420);
    } else {
      setMistakes((value) => value + 1);
      window.setTimeout(() => {
        setFlipped([]);
        setLocked(false);
        sfx.wrong();
        encourage();
      }, 900);
    }
  };

  // Fim de fase: avança ou encerra o jogo.
  useEffect(() => {
    if (cards.length === 0 || !cards.every((card) => card.matched)) return;
    const timer = window.setTimeout(() => {
      if (level < LEVELS.length - 1) {
        sfx.levelUp();
        nextLevel();
        setLevel(level + 1);
        startLevel(level + 1);
      } else {
        setWon(true);
        void finish(cards.length * 10, starsFromMistakes(mistakes));
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [cards, level, startLevel, finish, mistakes]);

  const columns = cards.length <= 6 ? "grid-cols-3" : "grid-cols-4";
  const matched = cards.filter((card) => card.matched).length / 2;

  return (
    <GameShell
      title="Memória dos Bichos"
      emoji="🐯"
      color="mango"
      instruction="Toque nas cartas e encontre os bichinhos iguais!"
      level={level + 1}
      totalLevels={LEVELS.length}
    >
      <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-pill bg-white/90 px-5 py-2 font-extrabold text-mango-700 shadow">
        <span aria-hidden>🐾</span>
        <span>
          {matched} de {cards.length / 2} pares
        </span>
      </div>

      <div className={`mx-auto grid max-w-2xl gap-3 ${columns}`}>
        {cards.map((card) => {
          const isOpen = card.matched || flipped.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(card.id)}
              disabled={card.matched}
              aria-label={isOpen ? card.name : "Carta virada para baixo"}
              className={`chunky chunky-card tap-target relative aspect-square overflow-hidden text-5xl sm:text-6xl ${
                isOpen ? "bg-cream" : "bg-mango-500"
              } ${card.matched ? "opacity-70" : ""}`}
              style={
                {
                  "--chunky-shade": isOpen ? "#ffdd8a" : "#9c5203",
                } as React.CSSProperties
              }
            >
              {isOpen ? (
                <span className="animate-pop-in block" aria-hidden>
                  {card.emoji}
                </span>
              ) : (
                /* Verso estampado: a carta parece um objeto, não um retângulo */
                <span className="flex h-full w-full items-center justify-center" aria-hidden>
                  <span className="dots absolute inset-0 opacity-40" />
                  <svg viewBox="0 0 64 64" className="relative h-2/5 w-2/5 fill-white/85">
                    <ellipse cx="20" cy="18" rx="7" ry="9" />
                    <ellipse cx="33" cy="13" rx="7" ry="10" />
                    <ellipse cx="46" cy="19" rx="7" ry="9" />
                    <ellipse cx="54" cy="33" rx="6" ry="8" />
                    <path d="M 33 30 c 12 0 20 10 20 17 c 0 7 -8 9 -20 9 c -12 0 -20 -2 -20 -9 c 0 -7 8 -17 20 -17 z" />
                  </svg>
                </span>
              )}
              {card.matched ? (
                <span className="absolute right-1.5 top-1.5 text-lg" aria-hidden>
                  ✅
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {won ? (
        <WinOverlay
          stars={starsFromMistakes(mistakes)}
          onReplay={restart}
          message="Você achou todos os bichinhos!"
        />
      ) : null}
    </GameShell>
  );
}
