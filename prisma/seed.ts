/**
 * Seed: cria o catálogo de jogos e o primeiro administrador.
 *
 * Rode com: npm run db:seed
 * As credenciais do admin vêm de SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 */
import { PrismaClient } from "@prisma/client";
import { GAMES } from "../src/games/catalog";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

async function seedGames() {
  for (const game of GAMES) {
    await db.game.upsert({
      where: { slug: game.slug },
      create: {
        slug: game.slug,
        title: game.title,
        description: game.description,
        category: game.category,
        emoji: game.emoji,
        color: game.color,
        minAge: game.minAge,
        maxAge: game.maxAge,
        isPremium: game.isPremium,
        sortOrder: game.sortOrder,
        learningGoals: JSON.stringify(game.learningGoals),
      },
      // Metadados editoriais são regravados; isActive/isPremium ficam como o
      // administrador deixou no painel.
      update: {
        title: game.title,
        description: game.description,
        category: game.category,
        emoji: game.emoji,
        color: game.color,
        minAge: game.minAge,
        maxAge: game.maxAge,
        sortOrder: game.sortOrder,
        learningGoals: JSON.stringify(game.learningGoals),
      },
    });
  }
  console.log(`✓ ${GAMES.length} jogos no catálogo`);
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@zuzuhop.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123456";

  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`• administrador ${email} já existe, nada a fazer`);
    return;
  }

  const { hash, salt } = await hashPassword(password);
  await db.adminUser.create({
    data: {
      email,
      name: "Administrador",
      role: "superadmin",
      passwordHash: hash,
      passwordSalt: salt,
      // Segredo TOTP e troca de senha são configurados no primeiro acesso.
      mustChangePassword: true,
    },
  });

  console.log(`✓ administrador criado: ${email}`);
  console.log("  Troque a senha e ative o 2FA no primeiro acesso em /admin/login");
}

async function main() {
  await seedGames();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
