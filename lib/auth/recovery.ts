export const MIN_PASSWORD_LENGTH = 6;

export type PasswordRecoveryState = {
  error?: string;
  message?: string;
};

const INTERNAL_AUTH_DESTINATIONS = new Set(["/app", "/auth/reset-password"]);

export function getSafeAuthNext(value: string | null | undefined) {
  const next = value?.trim() || "/app";

  return INTERNAL_AUTH_DESTINATIONS.has(next) ? next : null;
}

export function validatePasswordPair(password: string, confirmation: string) {
  if (!password || !confirmation) {
    return "Introduce la nueva contrasena y su confirmacion.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (password !== confirmation) {
    return "Las contrasenas no coinciden.";
  }

  return null;
}
