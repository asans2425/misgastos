"use client";

import { useEffect, useState } from "react";
import { AppSplash } from "@/components/ui/AppSplash";
import { cn } from "@/lib/utils/cn";

export function ClientBootSplash() {
  // Visible on the server-rendered HTML so the browser never paints a blank
  // frame while React is starting.
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let hasStartedLeaving = false;
    let hideTimer: number | undefined;

    const startLeaving = () => {
      if (hasStartedLeaving) return;
      hasStartedLeaving = true;
      setLeaving(true);
      hideTimer = window.setTimeout(() => setVisible(false), 300);
    };

    const waitForApp = () => {
      if (document.readyState === "complete") {
        startLeaving();
      } else {
        window.addEventListener("load", startLeaving, { once: true });
      }
    };

    // Keep the branded transition readable, then reveal the UI as soon as the
    // complete page has loaded. The fallback prevents a failed asset request
    // from leaving the splash on screen forever.
    const leaveTimer = window.setTimeout(waitForApp, 900);
    const fallbackTimer = window.setTimeout(startLeaving, 4000);

    return () => {
      window.clearTimeout(leaveTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("load", startLeaving);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[9999] bg-brand transition-opacity duration-300",
        leaving && "opacity-0",
      )}
      style={{ backgroundColor: "#0f766e" }}
    >
      <AppSplash />
    </div>
  );
}
