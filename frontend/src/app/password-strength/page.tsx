"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

function scorePassword(password: string): { score: number; feedback: string } {
  if (!password) return { score: 0, feedback: "Enter a password to check." };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;
  if (/(.)\1{2,}/.test(password)) score -= 1;
  if (/^(?:123456|password|qwerty|abc123)/i.test(password)) score -= 2;
  score = Math.max(0, Math.min(5, score));

  const feedback =
    score <= 1
      ? "Very weak — use more length and character types."
      : score === 2
        ? "Weak — add length or more character types."
        : score === 3
          ? "Fair — good start; consider more length or symbols."
          : score === 4
            ? "Strong — good mix of length and character types."
            : "Very strong.";

  return { score, feedback };
}

export default function PasswordStrengthPage() {
  const [password, setPassword] = useState("");

  const { score, feedback } = useMemo(() => scorePassword(password), [password]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Password strength</h1>
        <p className="text-muted-foreground mb-6">
          Check password strength. Score and short feedback only; nothing is sent to a server.
        </p>
        <div className="space-y-4 rounded-2xl bg-card border border-border p-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type or paste password…"
              className="w-full max-w-md rounded-xl border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>
          {password && (
            <>
              <div>
                <span className="text-sm text-muted-foreground">Score</span>
                <div className="mt-1 flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded ${
                        i < score
                          ? score <= 2
                            ? "bg-destructive"
                            : score <= 3
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{score} / 5</p>
              </div>
              <p className="text-sm text-foreground">{feedback}</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
