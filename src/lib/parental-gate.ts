import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/**
 * Portão parental.
 *
 * Barreira entre o modo criança e as áreas de adulto (configurações, conta,
 * compras). Não é autenticação — é um obstáculo cognitivo que uma criança de
 * 2 a 8 anos não transpõe: um número escrito por extenso, que precisa ser
 * digitado em algarismos, somado a uma multiplicação.
 *
 * O desafio é sem estado: a resposta esperada viaja assinada por HMAC, com
 * validade curta. Não dá para adivinhar nem para forjar no cliente.
 */

const TTL_MS = 5 * 60_000;

const UNITS = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete",
  "dezoito", "dezenove",
];
const TENS = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta",
  "oitenta", "noventa",
];

export function numberToWords(value: number): string {
  if (value < 20) return UNITS[value]!;
  const tens = Math.floor(value / 10);
  const units = value % 10;
  return units === 0 ? TENS[tens]! : `${TENS[tens]} e ${UNITS[units]}`;
}

function sign(payload: string): string {
  return createHmac("sha256", env.authSecret).update(payload).digest("base64url");
}

export interface GateChallenge {
  question: string;
  token: string;
}

export function createChallenge(): GateChallenge {
  const left = 3 + Math.floor(Math.random() * 7); // 3..9
  const right = 4 + Math.floor(Math.random() * 6); // 4..9
  const answer = left * right;
  const expiresAt = Date.now() + TTL_MS;

  const payload = `${answer}.${expiresAt}`;
  return {
    question: `Quanto é ${numberToWords(left)} vezes ${numberToWords(right)}?`,
    token: `${payload}.${sign(payload)}`,
  };
}

export function verifyChallenge(token: string, answer: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expected, expiresAt, signature] = parts as [string, string, string];
  const payload = `${expected}.${expiresAt}`;

  const expectedSignature = Buffer.from(sign(payload));
  const providedSignature = Buffer.from(signature);
  if (expectedSignature.length !== providedSignature.length) return false;
  if (!timingSafeEqual(expectedSignature, providedSignature)) return false;

  if (Number(expiresAt) < Date.now()) return false;

  return answer.replace(/\D/g, "") === expected;
}
