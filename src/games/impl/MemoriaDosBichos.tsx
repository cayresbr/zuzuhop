"use client";

import { useCallback, useEffect, useState } from "react";
import { GameShell, WinOverlay } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { sfx, speak } from "../sound";
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
        speak(first.name);
      }, 420);
    } else {
      setMistakes((value) => value + 1);
      window.setTimeout(() => {
        setFlipped([]);
        setLocked(false);
        sfx.wrong();
      }, 900);
    }
  };

  // Fim de fase: avança ou encerra o jogo.
  useEffect(() => {
    if (cards.length === 0 || !cards.every((card) => card.matched)) return;
    const timer = window.setTimeout(() => {
      if (level < LEVELS.length - 1) {
        speak("Muito bem! Próxima fase.");
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

  return (
    <GameShell
      title="Memória dos Bichos"
      emoji="🐯"
      color="mango"
      instruction="Toque nas cartas e encontre os bichinhos iguais!"
      level={level + 1}
      totalLevels={LEVELS.length}
    >
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
              className={`tap-target aspect-square rounded-3xl text-5xl shadow-lg transition-all duration-200 sm:text-6xl ${
                isOpen
                  ? "bg-white scale-100"
                  : "bg-mango-600 text-transparent hover:scale-105 active:scale-95"
              } ${card.matched ? "animate-pop-in opacity-60" : ""}`}
            >
              <span aria-hidden>{isOpen ? card.emoji : "❓"}</span>
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
