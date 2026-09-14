import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "E-mail inválido.")
  .max(254)
  .email("E-mail inválido.");

export const passwordSchema = z.string().min(10, "Mínimo de 10 caracteres.").max(200);

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  email: emailSchema,
  password: passwordSchema,
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "É preciso aceitar os termos e a política de privacidade." }),
  }),
  isGuardian: z.literal(true, {
    errorMap: () => ({ message: "Confirme que você é o responsável legal pela criança." }),
  }),
  marketingOptIn: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha.").max(200),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha.").max(200),
  totp: z.string().trim().regex(/^\d{6}$/, "Código de 6 dígitos.").optional(),
});

export const AVATARS = [
  "panda",
  "raposa",
  "dino",
  "astronauta",
  "gatinho",
  "robo",
  "coruja",
  "leao",
  "polvo",
  "unicornio",
  "tubarao",
  "sapo",
] as const;

export const THEME_COLORS = [
  "grape",
  "mango",
  "mint",
  "sky",
  "coral",
  "lime",
] as const;

export const CATEGORIES = [
  "letras",
  "numeros",
  "cores",
  "musica",
  "logica",
  "criatividade",
  "mundo",
  "emocoes",
] as const;

const currentYear = new Date().getFullYear();

export const childProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Escolha um apelido.")
    .max(20, "Apelido muito longo.")
    // Só letras/espaços: evita que se digite nome completo, e-mail ou telefone.
    .regex(/^[\p{L}\p{N} '-]+$/u, "Use apenas letras e números."),
  birthYear: z
    .number()
    .int()
    .min(currentYear - 12, "Ano de nascimento fora da faixa atendida.")
    .max(currentYear, "Ano de nascimento inválido."),
  avatar: z.enum(AVATARS),
  themeColor: z.enum(THEME_COLORS),
  dailyLimitMinutes: z.number().int().min(5).max(180),
  allowedCategories: z.array(z.enum(CATEGORIES)).nullable().optional(),
  soundEnabled: z.boolean().optional(),
  musicEnabled: z.boolean().optional(),
});

export const progressSchema = z.object({
  gameSlug: z.string().trim().min(1).max(60),
  score: z.number().int().min(0).max(100_000),
  stars: z.number().int().min(0).max(3),
  seconds: z.number().int().min(0).max(3600),
});

/** Formata erros do Zod em um mapa campo -> mensagem. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
