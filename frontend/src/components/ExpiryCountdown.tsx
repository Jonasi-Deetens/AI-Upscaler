"use client";

import { useEffect, useState } from "react";

interface ExpiryCountdownProps {
  expiresAt: string;
  className?: string;
}

export function ExpiryCountdown({ expiresAt, className = "" }: ExpiryCountdownProps) {
  const [remaining, setRemaining] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const end = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      if (diff === 0) {
        setRemaining("expired");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining === "expired") {
    return (
      <span className={`text-sm text-amber-600 dark:text-amber-400 ${className}`}>
        Result expired
      </span>
    );
  }
  return (
    <span className={`text-sm text-amber-600 dark:text-amber-400 ${className}`}>
      {remaining ? `Download expires in ${remaining}` : "Download expires in …"}
    </span>
  );
}
