import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getFamilySession } from "@/lib/session";
import { getScreenTimeStatus } from "@/lib/screen-time";
import { avatarEmoji, ageFromBirthYear, themeBg } from "@/lib/avatars";
import { SkyScene } from "@/components/scenery";
import { ZuzuEHop } from "@/components/mascots";
import { entrarModoCrianca } from "../familia/actions";
import { KidsHome } from "./kids-home";

export const dynamic = "force-dynamic";

export default async function KidsPage() {
  const session = (await getFamilySession())!;

  const children = await db.childProfile.findMany({
    where: { guardianId: session.guardian.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (children.length === 0) redirect("/familia/perfis/novo");

  const activeChild = session.activeChildId
    ? children.find((child) => child.id === session.activeChildId)
    : undefined;

  // Sem perfil ativo: a criança escolhe o seu, com avatares grandes.
  if (!activeChild) {
    return (
      <SkyScene className="kid-mode">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
          <ZuzuEHop size={130} className="mb-2" />

          <h1 className="rounded-blob bg-white/95 px-7 py-4 text-center font-display text-2xl font-extrabold text-ink shadow-lg sm:text-3xl">
            Quem vai brincar hoje? <span aria-hidden>🎈</span>
          </h1>

          <div className="mt-9 flex flex-wrap justify-center gap-5">
            {children.map((child) => (
              <form key={child.id} action={entrarModoCrianca}>
                <input type="hidden" name="childId" value={child.id} />
                <button
                  type="submit"
                  className="chunky chunky-card flex w-40 flex-col items-center gap-3 bg-cream p-5"
                  style={{ "--chunky-shade": "#d6c5ff" } as React.CSSProperties}
                >
                  <span
                    className={`glossy relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-6xl ring-4 ring-white ${themeBg(child.themeColor)}`}
                    aria-hidden
                  >
                    {avatarEmoji(child.avatar)}
                  </span>
                  <span className="font-display text-xl font-extrabold text-ink">
                    {child.nickname}
                  </span>
                  <span className="text-sm font-bold text-ink-faint">
                    {ageFromBirthYear(child.birthYear)} anos
                  </span>
                </button>
              </form>
            ))}
          </div>
        </div>
      </SkyScene>
    );
  }

  const screenTime = await getScreenTimeStatus(activeChild.id);
  if (screenTime.blocked) redirect("/kids/fim");

  const allowedCategories = activeChild.allowedCategories
    ? (JSON.parse(activeChild.allowedCategories) as string[])
    : null;

  const age = ageFromBirthYear(activeChild.birthYear);

  const games = await db.game.findMany({
    where: {
      isActive: true,
      minAge: { lte: Math.max(age, 2) },
      maxAge: { gte: Math.min(age, 8) },
      ...(allowedCategories ? { category: { in: allowedCategories } } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <KidsHome
      child={{
        nickname: activeChild.nickname,
        avatar: activeChild.avatar,
        themeColor: activeChild.themeColor,
        soundEnabled: activeChild.soundEnabled,
      }}
      plan={session.guardian.plan}
      remainingMinutes={Math.ceil(screenTime.remainingSeconds / 60)}
      games={games.map((game) => ({
        slug: game.slug,
        title: game.title,
        emoji: game.emoji,
        color: game.color,
        category: game.category,
        isPremium: game.isPremium,
      }))}
    />
  );
}
