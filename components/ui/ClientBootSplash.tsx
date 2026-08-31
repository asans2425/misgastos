"use client";

import { useEffect, useState } from "react";
import { AppSplash } from "@/components/ui/AppSplash";
import { cn } from "@/lib/utils/cn";

export function ClientBootSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 950);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1250);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[9999] transition-opacity duration-300",
        leaving && "opacity-0",
      )}
    >
      <AppSplash />
    </div>
  );
}
