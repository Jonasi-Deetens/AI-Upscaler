"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { HTTP_STATUS_LIST } from "@/lib/httpStatus";

export default function HttpStatusPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HTTP_STATUS_LIST;
    return HTTP_STATUS_LIST.filter(
      (s) =>
        String(s.code).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">HTTP status lookup</h1>
        <p className="text-muted-foreground mb-6">
          Search by code or name to see meaning and description.
        </p>
        <div className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 404 or Not Found"
            className="w-full max-w-sm rounded-xl border border-input bg-background px-3 py-2 text-foreground"
          />
          <div className="rounded-xl border border-input overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 font-medium text-foreground">Code</th>
                  <th className="px-4 py-2 font-medium text-foreground">Name</th>
                  <th className="px-4 py-2 font-medium text-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.code} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-mono text-foreground">{s.code}</td>
                    <td className="px-4 py-2 text-foreground">{s.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-muted-foreground text-sm">No matches.</p>}
        </div>
      </div>
    </main>
  );
}
