const missingSchemaSignals = [
  "schema cache",
  "could not find the table",
  "relation",
  "does not exist",
];

export class SupabaseSchemaMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseSchemaMissingError";
  }
}

export function isSupabaseSchemaMissingError(error: unknown) {
  if (error instanceof SupabaseSchemaMissingError) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    code?: string;
    message?: string;
  };
  const message = maybeError.message?.toLowerCase() ?? "";

  return (
    maybeError.code === "PGRST205" ||
    maybeError.code === "42P01" ||
    missingSchemaSignals.some((signal) => message.includes(signal))
  );
}

export function throwIfSupabaseError(error: unknown) {
  if (!error) {
    return;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "Supabase request failed.";

  if (isSupabaseSchemaMissingError(error)) {
    throw new SupabaseSchemaMissingError(message);
  }

  throw new Error(message);
}
