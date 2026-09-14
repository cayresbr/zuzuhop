"use client";

import Link from "next/link";
import { useEffect } from "react";
import { avatarEmoji, themeBg } from "@/lib/avatars";
import { CATEGORY_LABELS, type Category } from "@/games/catalog";
import { setSoundEnabled, sfx, speak } from "@/games/sound";

const TILE_BG: Record<string, string> = {
  grape: "bg-grape-500",
  mango: "bg-mango-400",
  mint: "bg-mint-500",
  sky: "bg-sky-500",
  coral: "bg-coral-500",
  lime: "bg-lime-500",
};

interface GameTile {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  category: string;
  isPremium: boolean;
}

export function KidsHome({
  child,
  plan,
  remainingMinutes,
  games,
}: {
  child: { nickname: string; avatar: string; themeColor: string; soundEnabled: boolean };
  plan: string;
  remainingMinutes: number;
  games: GameTile[];
}) {
  useEffect(() => {
    setSoundEnabled(child.soundEnabled);
    const timer = window.setTimeout(
      () => speak(`Oi, ${child.nickname}! O que vamos brincar hoje?`),
      700,
    );
    return () => window.clearTimeout(timer);
  }, [child.nickname, child.soundEnabled]);

  const categories = [...new Set(games.map((game) => game.category))] as Category[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-grape-100 pb-16">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-full text-4xl ${themeBg(child.themeColor)}`}
            aria-hidden
          >
            {avatarEmoji(child.avatar)}
          </span>
          <div>
            <p className="text-2xl font-extrabold text-ink">Oi, {child.nickname}!</p>
            <p className="text-sm font-bold text-ink-soft">
              ⏱️ {remainingMinutes} min de brincadeira hoje
            </p>
          </div>
        </div>

        {/* Único caminho de saída do modo criança: passa pelo portão parental. */}
        <Link
          href="/kids/adultos"
          onClick={() => sfx.tap()}
          className="tap-target flex items-center justify-center rounded-full bg-white/90 px-5 text-lg font-bold text-ink-soft shadow"
        >
          Adultos 🔒
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        {categories.map((category) => {
          const list = games.filter((game) => game.category === category);
          return (
            <section key={category} className="mb-8">
              <h2 className="mb-3 text-xl font-extrabold text-ink">
                <span aria-hidden>{CATEGORY_LABELS[category]?.emoji}</span>{" "}
                {CATEGORY_LABELS[category]?.label ?? category}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((game) => {
                  const locked = game.isPremium && plan !== "plus";
                  const tile = TILE_BG[game.color] ?? TILE_BG.grape;

                  if (locked) {
                    return (
                      <div
                        key={game.slug}
                        className={`relative flex aspect-square flex-col items-center justify-center gap-2 rounded-blob ${tile} p-4 opacity-60 shadow-lg`}
                        aria-label={`${game.title} — disponível no plano Plus`}
                      >
                        <span className="text-5xl grayscale sm:text-6xl" aria-hidden>
                          {game.emoji}
                        </span>
                        <span className="text-center text-sm font-extrabold text-white">
                          {game.title}
                        </span>
                        <span className="absolute right-3 top-3 text-2xl" aria-hidden>
                          🔒
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={game.slug}
                      href={`/kids/jogo/${game.slug}`}
                      onClick={() => {
                        sfx.pop();
                        speak(game.title);
                      }}
                      className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-blob ${tile} p-4 shadow-lg transition hover:scale-105 active:scale-95`}
                    >
                      <span className="text-5xl sm:text-6xl" aria-hidden>
                        {game.emoji}
                      </span>
                      <span className="text-center text-sm font-extrabold leading-tight text-white sm:text-base">
                        {game.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
