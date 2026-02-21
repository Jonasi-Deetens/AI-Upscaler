"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const TOTP_STEP = 30;

function base32Decode(encoded: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = encoded.toUpperCase().replace(/\s/g, "").replace(/=+$/, "");
  const bits: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx < 0) throw new Error("Invalid base32");
    for (let b = 4; b >= 0; b--) bits.push((idx >> b) & 1);
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}

async function hotp(secret: Uint8Array, counter: number): Promise<number> {
  const data = new ArrayBuffer(8);
  const view = new DataView(data);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);
  const key = await crypto.subtle.importKey(
    "raw",
    secret as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new Uint8Array(data)
  );
  const sigBytes = new Uint8Array(sig);
  const offset = sigBytes[19]! & 0x0f;
  const code = ((sigBytes[offset]! & 0x7f) << 24) | (sigBytes[offset + 1]! << 16) | (sigBytes[offset + 2]! << 8) | sigBytes[offset + 3]!;
  return code % 1_000_000;
}

export default function OtpGeneratorPage() {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTP_STEP);

  const updateCode = useCallback(async () => {
    const s = secret.trim().replace(/\s/g, "");
    if (!s) {
      setCode(null);
      setError(null);
      return;
    }
    try {
      const key = base32Decode(s);
      const counter = Math.floor(Date.now() / 1000 / TOTP_STEP);
      const num = await hotp(key, counter);
      setCode(num.toString().padStart(6, "0"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid secret");
      setCode(null);
    }
  }, [secret]);

  useEffect(() => {
    updateCode();
    const interval = setInterval(updateCode, TOTP_STEP * 1000);
    return () => clearInterval(interval);
  }, [updateCode]);

  useEffect(() => {
    const tick = () => setSecondsLeft(TOTP_STEP - (Math.floor(Date.now() / 1000) % TOTP_STEP));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const copy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">OTP / 2FA generator</h1>
        <p className="text-muted-foreground mb-6">
          Time-based 6-digit code (TOTP) from a base32 secret. Client-only; secret never leaves your device.
        </p>
        <div className="space-y-4 rounded-2xl bg-card border border-border p-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Base32 secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="e.g. JBSWY3DPEHPK3PXP"
              className="w-full max-w-md rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {code && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current code (refreshes every 30s)</p>
              <p className="text-3xl font-mono tracking-widest text-foreground">{code}</p>
              <p className="text-sm text-muted-foreground">Next code in {secondsLeft}s</p>
              <Button type="button" variant="secondary" onClick={copy}>
                {copied ? "Copied" : "Copy code"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
