"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bubbles, SkyScene } from "@/components/scenery";
import { Zuzu } from "@/components/mascots";
import { avatarEmoji, themeBg } from "@/lib/avatars";
import { CATEGORY_LABELS, type Category } from "@/games/catalog";
import { greet, primeAudio, setSoundEnabled, sfx, speak } from "@/games/sound";

/** Cor do card + a sombra sólida embaixo dele. */
const TILE: Record<string, { bg: string; shade: string }> = {
  grape: { bg: "bg-grape-500", shade: "#4d22b4" },
  mango: { bg: "bg-mango-400", shade: "#9c5203" },
  mint: { bg: "bg-mint-500", shade: "#09684d" },
  sky: { bg: "bg-sky-500", shade: "#0e4c8a" },
  coral: { bg: "bg-coral-500", shade: "#9c1d1d" },
  lime: { bg: "bg-lime-500", shade: "#456d12" },
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
  /**
   * Um filtro em vez de oito seções.
   *
   * Agrupar por categoria deixava a tela com um card por linha — nove jogos
   * viravam uma coluna de três metros. Com uma grade única e chips de filtro,
   * tudo cabe em uma tela e a criança ainda navega por assunto, tocando num
   * emoji. Chip é alvo grande e não exige leitura.
   */
  const [filter, setFilter] = useState<Category | "tudo">("tudo");

  useEffect(() => {
    setSoundEnabled(child.soundEnabled);
    primeAudio();
    const timer = window.setTimeout(() => greet(child.nickname), 800);
    return () => window.clearTimeout(timer);
  }, [child.nickname, child.soundEnabled]);

  const categories = [...new Set(games.map((game) => game.category))] as Category[];
  const visible = filter === "tudo" ? games : games.filter((game) => game.category === filter);

  return (
    <SkyScene className="kid-mode">
      <Bubbles />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-5 sm:px-6">
        {/* ------------------------------------------------------------ topo */}
        <header className="relative flex items-center gap-4 rounded-blob bg-white/92 p-4 pr-3 shadow-lg backdrop-blur-sm sm:p-5">
          <span
            className={`glossy relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-4xl ring-4 ring-white sm:h-20 sm:w-20 sm:text-5xl ${themeBg(child.themeColor)}`}
            aria-hidden
          >
            {avatarEmoji(child.avatar)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Oi, {child.nickname}!
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-pill bg-mint-100 px-3 py-1 text-sm font-extrabold text-mint-700">
              <span aria-hidden>⏱️</span>
              {remainingMinutes} min de brincadeira hoje
            </p>
          </div>

          <Zuzu
            mood="feliz"
            size={78}
            className="hidden shrink-0 animate-breathe sm:block"
          />

          {/* Único caminho de saída do modo criança: passa pelo portão parental. */}
          <Link
            href="/kids/adultos"
            onClick={() => sfx.tap()}
            aria-label="Área dos adultos"
            className="chunky tap-target flex shrink-0 items-center justify-center gap-2 bg-grape-100 px-4 font-display text-base font-extrabold text-grape-700"
            style={{ "--chunky-shade": "#b99cff" } as React.CSSProperties}
          >
            <span aria-hidden>🔒</span>
            <span className="hidden sm:inline">Adultos</span>
          </Link>
        </header>

        {/* --------------------------------------------------------- filtros */}
        <div
          className="rail mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible"
          role="group"
          aria-label="Filtrar jogos por assunto"
        >
          <FilterChip
            active={filter === "tudo"}
            emoji="🌈"
            label="Tudo"
            onClick={() => {
              setFilter("tudo");
              sfx.pop();
            }}
          />
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={filter === category}
              emoji={CATEGORY_LABELS[category]?.emoji ?? "🎮"}
              label={CATEGORY_LABELS[category]?.short ?? category}
              onClick={() => {
                setFilter(category);
                sfx.pop();
                speak(CATEGORY_LABELS[category]?.label ?? category);
              }}
            />
          ))}
        </div>

        {/* ----------------------------------------------------------- jogos */}
        <main className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((game, index) => {
            const locked = game.isPremium && plan !== "plus";
            const tile = TILE[game.color] ?? TILE.grape!;
            const badge = CATEGORY_LABELS[game.category as Category]?.emoji;

            if (locked) {
              return (
                <div
                  key={game.slug}
                  className={`relative flex aspect-square flex-col items-center justify-center gap-3 rounded-blob ${tile.bg} p-4 opacity-55 shadow-lg`}
                  aria-label={`${game.title} — disponível no plano Plus`}
                >
                  <span className="text-5xl grayscale sm:text-6xl" aria-hidden>
                    {game.emoji}
                  </span>
                  <span className="rounded-pill bg-white/90 px-3 py-1 text-center font-display text-sm font-extrabold text-ink">
                    {game.title}
                  </span>
                  <span
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow"
                    aria-hidden
                  >
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
                  primeAudio();
                  sfx.pop();
                  speak(game.title);
                }}
                className={`chunky chunky-card glossy hover-hop animate-pop-in relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden ${tile.bg} p-4`}
                style={
                  {
                    "--chunky-shade": tile.shade,
                    animationDelay: `${index * 45}ms`,
                  } as React.CSSProperties
                }
              >
                <span className="dots absolute inset-0 opacity-25" aria-hidden />

                {/* Selo de assunto: orienta sem exigir leitura */}
                <span
                  className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base shadow-sm"
                  aria-hidden
                >
                  {badge}
                </span>

                <span className="relative text-5xl drop-shadow sm:text-6xl" aria-hidden>
                  {game.emoji}
                </span>
                <span className="relative rounded-pill bg-white/95 px-3 py-1 text-center font-display text-sm font-extrabold leading-tight text-ink sm:text-base">
                  {game.title}
                </span>
              </Link>
            );
          })}
        </main>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-blob bg-white/90 p-8 text-center font-display text-xl font-extrabold text-ink-soft">
            Nenhum jogo aqui ainda. Toque em <span aria-hidden>🌈</span> Tudo!
          </p>
        ) : null}
      </div>
    </SkyScene>
  );
}

function FilterChip({
  active,
  emoji,
  label,
  onClick,
}: {
  active: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-2 rounded-pill px-4 py-2.5 font-display text-sm font-extrabold transition-transform duration-150 active:scale-95 ${
        active
          ? "bg-grape-500 text-white shadow-lg"
          : "bg-white/90 text-ink-soft shadow-sm"
      }`}
    >
      <span className="text-lg" aria-hidden>
        {emoji}
      </span>
      {label}
    </button>
  );
}
