import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

// Parâmetros OWASP para scrypt (N=2^16, r=8, p=1).
const PARAMS = { N: 65536, r: 8, p: 1, maxmem: 128 * 65536 * 8 * 2 };
const KEY_LENGTH = 64;

export async function hashPassword(
  plain: string,
): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16);
  const derived = await scrypt(plain.normalize("NFKC"), salt, KEY_LENGTH, PARAMS);
  return { hash: derived.toString("base64"), salt: salt.toString("base64") };
}

export async function verifyPassword(
  plain: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  try {
    const derived = await scrypt(
      plain.normalize("NFKC"),
      Buffer.from(salt, "base64"),
      KEY_LENGTH,
      PARAMS,
    );
    const expected = Buffer.from(hash, "base64");
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Gasta o mesmo tempo de um hash real. Usado quando o e-mail não existe,
 * para que o atacante não consiga enumerar contas pelo tempo de resposta.
 */
export async function fakeVerifyDelay(): Promise<void> {
  await scrypt("senha-inexistente", randomBytes(16), KEY_LENGTH, PARAMS);
}

export interface PasswordCheck {
  ok: boolean;
  problems: string[];
}

const COMMON = new Set([
  "12345678",
  "123456789",
  "senha123",
  "password",
  "password1",
  "qwertyui",
  "adminadmin",
  "zuzuhop123",
]);

export function checkPasswordStrength(plain: string): PasswordCheck {
  const problems: string[] = [];
  if (plain.length < 10) problems.push("Use pelo menos 10 caracteres.");
  if (plain.length > 200) problems.push("Senha longa demais (máx. 200).");
  if (!/[a-z]/.test(plain)) problems.push("Inclua uma letra minúscula.");
  if (!/[A-Z]/.test(plain)) problems.push("Inclua uma letra maiúscula.");
  if (!/[0-9]/.test(plain)) problems.push("Inclua um número.");
  if (COMMON.has(plain.toLowerCase())) problems.push("Senha muito comum.");
  return { ok: problems.length === 0, problems };
}
