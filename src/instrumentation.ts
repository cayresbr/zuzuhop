/**
 * Validação de ambiente no boot do servidor.
 *
 * Sem isto, um AUTH_SECRET ausente ou de exemplo só estoura quando alguém
 * abre a primeira página que assina algo — vira um 500 opaco em produção, com
 * a causa escondida no log. Aqui a falha aparece no terminal, no start, com o
 * comando exato para resolver.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const problems: string[] = [];
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    problems.push("AUTH_SECRET ausente ou com menos de 32 caracteres.");
  } else if (
    process.env.NODE_ENV === "production" &&
    secret.startsWith("troque-este-valor")
  ) {
    problems.push("AUTH_SECRET ainda está com o valor de exemplo do .env.example.");
  }

  if (!process.env.DATABASE_URL) {
    problems.push("DATABASE_URL ausente.");
  }

  if (problems.length > 0) {
    const message = [
      "",
      "┌──────────────────────────────────────────────────────────────┐",
      "│  Zuzuhop não pode iniciar: configuração de ambiente inválida │",
      "└──────────────────────────────────────────────────────────────┘",
      "",
      ...problems.map((problem) => `  ✗ ${problem}`),
      "",
      "  Para resolver:",
      "    npm run setup      (cria o .env e gera um AUTH_SECRET aleatório)",
      "",
      "  Ou gere um segredo à mão:",
      '    node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
      "",
    ].join("\n");

    console.error(message);
    throw new Error("Configuração de ambiente inválida. Veja as instruções acima.");
  }
}
