import assert from "node:assert/strict";
import test from "node:test";
import {
  getSafeAuthNext,
  MIN_PASSWORD_LENGTH,
  validatePasswordPair,
} from "../lib/auth/recovery.ts";

test("solo permite destinos internos conocidos en el callback", () => {
  assert.equal(getSafeAuthNext("/app"), "/app");
  assert.equal(getSafeAuthNext("/auth/reset-password"), "/auth/reset-password");
  assert.equal(getSafeAuthNext("https://evil.example"), null);
  assert.equal(getSafeAuthNext("//evil.example"), null);
  assert.equal(getSafeAuthNext("/app?next=https://evil.example"), null);
  assert.equal(getSafeAuthNext(null), "/app");
});

test("valida la nueva contraseña y su confirmación", () => {
  assert.equal(
    validatePasswordPair("a".repeat(MIN_PASSWORD_LENGTH - 1), "a".repeat(5)),
    "La contrasena debe tener al menos 6 caracteres.",
  );
  assert.equal(
    validatePasswordPair("password", "different"),
    "Las contrasenas no coinciden.",
  );
  assert.equal(validatePasswordPair("password", "password"), null);
});
