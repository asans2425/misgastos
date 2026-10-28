import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSafeAuthNext } from "@/lib/auth/recovery";
import { prepareCurrentUser } from "@/lib/auth/prepareUser";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RECOVERY_INTENT_COOKIE = "moneyflow-recovery-intent";
const RECOVERY_SESSION_COOKIE = "moneyflow-recovery-session";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeAuthNext(requestUrl.searchParams.get("next"));
  const cookieStore = await cookies();

  if (!next) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_redirect", requestUrl.origin),
    );
  }

  if (next === "/auth/reset-password") {
    const recoveryIntent = cookieStore.get(RECOVERY_INTENT_COOKIE)?.value;

    if (recoveryIntent !== "1") {
      return NextResponse.redirect(
        new URL("/login?error=recovery_invalid", requestUrl.origin),
      );
    }
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=recovery_invalid", requestUrl.origin),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=recovery_expired", requestUrl.origin),
    );
  }

  if (next === "/auth/reset-password") {
    cookieStore.delete(RECOVERY_INTENT_COOKIE);
    cookieStore.set(RECOVERY_SESSION_COOKIE, "1", {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: requestUrl.protocol === "https:",
    });
  } else {
    await prepareCurrentUser();
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
