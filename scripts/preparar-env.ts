/**
 * Prepara o arquivo .env para desenvolvimento.
 *
 * Roda dentro de `npm run setup`. Cria o .env a partir do .env.example e
 * substitui o AUTH_SECRET de exemplo por um segredo aleatório de verdade.
 *
 * Motivo: o app se recusa a subir em produção com o segredo de exemplo (e deve
 * mesmo). Deixar o placeholder no .env fazia `npm run build && npm start`
 * quebrar com um 500 sem explicação na primeira página que usasse HMAC.
 */
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");
const examplePath = resolve(root, ".env.example");

if (!existsSync(envPath)) {
  copyFileSync(examplePath, envPath);
  console.log("✓ .env criado a partir do .env.example");
}

const content = readFileSync(envPath, "utf8");

if (content.includes("troque-este-valor")) {
  const secret = randomBytes(48).toString("base64url");
  writeFileSync(
    envPath,
    content.replace(/AUTH_SECRET="[^"]*"/, `AUTH_SECRET="${secret}"`),
  );
  console.log("✓ AUTH_SECRET gerado (48 bytes aleatórios)");
} else {
  console.log("• AUTH_SECRET já configurado");
}
