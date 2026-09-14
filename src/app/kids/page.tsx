import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getFamilySession } from "@/lib/session";
import { getScreenTimeStatus } from "@/lib/screen-time";
import { avatarEmoji, ageFromBirthYear, themeBg } from "@/lib/avatars";
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-grape-400 to-grape-600 p-6">
        <h1 className="text-center text-3xl font-extrabold text-white drop-shadow sm:text-4xl">
          Quem vai brincar? <span aria-hidden>🎈</span>
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {children.map((child) => (
            <form key={child.id} action={entrarModoCrianca}>
              <input type="hidden" name="childId" value={child.id} />
              <button
                type="submit"
                className="flex w-36 flex-col items-center gap-3 rounded-blob bg-white/95 p-5 shadow-xl transition active:scale-95"
              >
                <span
                  className={`flex h-24 w-24 items-center justify-center rounded-full text-6xl ${themeBg(child.themeColor)}`}
                  aria-hidden
                >
                  {avatarEmoji(child.avatar)}
                </span>
                <span className="text-xl font-extrabold text-ink">{child.nickname}</span>
              </button>
            </form>
          ))}
        </div>
      </div>
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
