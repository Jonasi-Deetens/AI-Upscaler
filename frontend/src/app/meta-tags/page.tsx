"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function MetaTagsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [twitterCard, setTwitterCard] = useState<"summary" | "summary_large_image">("summary_large_image");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    const parts: string[] = [];
    if (title) parts.push('<meta name="title" content="' + escapeAttr(title) + '">');
    if (description) parts.push('<meta name="description" content="' + escapeAttr(description) + '">');
    if (url) {
      parts.push('<meta property="og:url" content="' + escapeAttr(url) + '">');
      parts.push('<meta name="twitter:url" content="' + escapeAttr(url) + '">');
    }
    if (title) {
      parts.push('<meta property="og:title" content="' + escapeAttr(title) + '">');
      parts.push('<meta name="twitter:title" content="' + escapeAttr(title) + '">');
    }
    if (description) {
      parts.push('<meta property="og:description" content="' + escapeAttr(description) + '">');
      parts.push('<meta name="twitter:description" content="' + escapeAttr(description) + '">');
    }
    if (imageUrl) {
      parts.push('<meta property="og:image" content="' + escapeAttr(imageUrl) + '">');
      parts.push('<meta name="twitter:image" content="' + escapeAttr(imageUrl) + '">');
    }
    if (siteName) parts.push('<meta property="og:site_name" content="' + escapeAttr(siteName) + '">');
    parts.push('<meta name="twitter:card" content="' + twitterCard + '">');
    return parts.join("\n");
  }, [title, description, url, imageUrl, siteName, twitterCard]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [html]);

  const download = useCallback(() => {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "meta-tags.html";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [html]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link href="/" className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Meta tag / OG generator</h1>
        <p className="text-muted-foreground mb-6">
          Generate meta tags, Open Graph, and Twitter Card HTML. Paste into your page head.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Page title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Page" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" rows={2} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Image URL</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/og.jpg" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Site name (optional)</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="My Site" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Twitter card</label>
              <select value={twitterCard} onChange={(e) => setTwitterCard(e.target.value as "summary" | "summary_large_image")} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground">
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Output</label>
            <textarea readOnly value={html} rows={14} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm" />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
              <Button type="button" variant="secondary" onClick={download}>Download</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
