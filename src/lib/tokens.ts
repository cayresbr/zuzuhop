import { createHash, randomBytes } from "node:crypto";

/** Token opaco de 32 bytes. O valor cru nunca é persistido. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
