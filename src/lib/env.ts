/**
 * Leitura validada das variáveis de ambiente.
 * Falha rápido no boot em vez de deixar o app subir com segredo fraco.
 */
function required(name: string, min = 1): string {
  const value = process.env[name];
  if (!value || value.length < min) {
    throw new Error(
      `Variável de ambiente ${name} ausente ou curta demais (mínimo ${min} caracteres). Veja .env.example.`,
    );
  }
  return value;
}

export const env = {
  get authSecret() {
    const secret = required("AUTH_SECRET", 32);
    if (
      process.env.NODE_ENV === "production" &&
      secret.startsWith("troque-este-valor")
    ) {
      throw new Error("AUTH_SECRET ainda está com o valor de exemplo.");
    }
    return secret;
  },
  get appOrigin() {
    return process.env.APP_ORIGIN ?? "http://localhost:3000";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};
