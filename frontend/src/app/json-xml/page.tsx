"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

const defaultParserOptions = {
  ignoreDeclaration: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
};
const defaultBuilderOptions = {
  format: true,
  indentBy: "  ",
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
};

export default function JsonXmlPage() {
  const [mode, setMode] = useState<"json-to-xml" | "xml-to-json">("json-to-xml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    setError(null);
    const raw = input.trim();
    if (!raw) {
      setOutput("");
      return;
    }
    try {
      if (mode === "xml-to-json") {
        const parser = new XMLParser(defaultParserOptions);
        const parsed = parser.parse(raw);
        if (parsed === undefined || parsed === null) {
          setError("Invalid or empty XML");
          setOutput("");
          return;
        }
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(raw) as object;
        const wrapped = Array.isArray(parsed) ? { root: { item: parsed } } : { root: parsed };
        const builder = new XMLBuilder(defaultBuilderOptions);
        const xml = builder.build(wrapped);
        setOutput(xml);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
      setOutput("");
    }
  }, [mode, input]);

  const copy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const download = useCallback(() => {
    if (!output) return;
    const ext = mode === "json-to-xml" ? "xml" : "json";
    const blob = new Blob([output], { type: mode === "json-to-xml" ? "application/xml" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, mode]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">JSON ↔ XML</h1>
        <p className="text-muted-foreground mb-6">
          Convert JSON to XML or XML to JSON. Paste or type, then copy or download.
        </p>
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "json-to-xml"}
                onChange={() => setMode("json-to-xml")}
                className="border-input"
              />
              <span className="text-sm text-foreground">JSON → XML</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={mode === "xml-to-json"}
                onChange={() => setMode("xml-to-json")}
                className="border-input"
              />
              <span className="text-sm text-foreground">XML → JSON</span>
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "json-to-xml" ? "Paste JSON…" : "Paste XML…"}
            className="w-full min-h-[180px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
          />
          <Button type="button" variant="cta" onClick={run}>
            Convert
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {output && (
            <div className="space-y-2">
              <textarea
                readOnly
                value={output}
                className="w-full min-h-[180px] rounded-xl border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button type="button" variant="secondary" onClick={download}>
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
