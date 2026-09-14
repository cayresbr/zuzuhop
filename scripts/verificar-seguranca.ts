/**
 * Testes das primitivas de segurança que não dependem de banco:
 * TOTP, portão parental e hashing de senha.
 *
 * Rode com: npm run test:seguranca
 */
import { generateTotpSecret, verifyTotp, buildOtpAuthUri, base32Decode, base32Encode } from "../src/lib/totp";
import { createChallenge, verifyChallenge, numberToWords } from "../src/lib/parental-gate";
import { hashPassword, verifyPassword, checkPasswordStrength } from "../src/lib/password";
import { createHmac } from "node:crypto";

function totpNow(secret: string): string {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const d = createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const off = d[d.length - 1]! & 0x0f;
  const bin = ((d[off]! & 0x7f) << 24) | ((d[off+1]! & 0xff) << 16) | ((d[off+2]! & 0xff) << 8) | (d[off+3]! & 0xff);
  return String(bin % 1e6).padStart(6, "0");
}

async function main() {
  let failures = 0;
  const check = (name: string, ok: boolean) => {
    console.log(`${ok ? "✓" : "✗"} ${name}`);
    if (!ok) failures++;
  };

  // Base32 round-trip
  check("base32 round-trip", base32Encode(base32Decode("JBSWY3DPEHPK3PXP")) === "JBSWY3DPEHPK3PXP");

  // TOTP
  const secret = generateTotpSecret();
  check("TOTP aceita código válido", verifyTotp(secret, totpNow(secret)));
  check("TOTP rejeita código errado", !verifyTotp(secret, "000000"));
  check("TOTP rejeita segredo de outra conta", !verifyTotp(generateTotpSecret(), totpNow(secret)));
  check("otpauth URI bem formada", buildOtpAuthUri({ secret, account: "a@b.com" }).startsWith("otpauth://totp/"));

  // Portão parental
  const challenge = createChallenge();
  const answer = challenge.question.match(/Quanto é (.+) vezes (.+)\?/)!;
  const words: Record<string, number> = {};
  for (let n = 0; n <= 99; n++) words[numberToWords(n)] = n;
  const expected = words[answer[1]!]! * words[answer[2]!]!;
  check("portão aceita resposta certa", verifyChallenge(challenge.token, String(expected)));
  check("portão rejeita resposta errada", !verifyChallenge(challenge.token, String(expected + 1)));
  check("portão rejeita token adulterado", !verifyChallenge(`${expected}.${Date.now() + 60000}.assinaturafalsa`, String(expected)));
  const [, exp, sig] = challenge.token.split(".");
  check("portão rejeita token expirado", !verifyChallenge(`${expected}.${Number(exp) - 999999}.${sig}`, String(expected)));

  // Senha
  const { hash, salt } = await hashPassword("SenhaForte123");
  check("senha correta valida", await verifyPassword("SenhaForte123", hash, salt));
  check("senha errada não valida", !(await verifyPassword("SenhaForte124", hash, salt)));
  const again = await hashPassword("SenhaForte123");
  check("hashes com salt diferente", again.hash !== hash);
  check("força: rejeita fraca", !checkPasswordStrength("senha123").ok);
  check("força: aceita boa", checkPasswordStrength("SenhaForte123").ok);

  console.log(failures === 0 ? "\nTodos os testes passaram." : `\n${failures} falha(s).`);
  process.exit(failures === 0 ? 0 : 1);
}
main();
