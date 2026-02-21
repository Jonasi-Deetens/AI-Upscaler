"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const FIRST_NAMES = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White"];
const DOMAINS = ["example.com", "test.org", "sample.net", "demo.io"];
const STREETS = ["123 Main St", "456 Oak Ave", "789 Pine Rd", "321 Elm St", "654 Maple Dr", "987 Cedar Ln"];
const CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin"];
const STATES = ["NY", "CA", "IL", "TX", "AZ", "PA", "FL", "OH", "GA", "NC"];
const ZIPS = ["10001", "90210", "60601", "77001", "85001", "19101", "33101", "43201", "30301", "28201"];
const COUNTRIES = ["United States", "Canada", "United Kingdom"];

type FieldId = "firstName" | "lastName" | "email" | "phone" | "address";

const FIELDS: { id: FieldId; label: string }[] = [
  { id: "firstName", label: "First name" },
  { id: "lastName", label: "Last name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "address", label: "Address" },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOne(include: Set<FieldId>) {
  const first = include.has("firstName") ? pick(FIRST_NAMES) : "";
  const last = include.has("lastName") ? pick(LAST_NAMES) : "";
  const email = include.has("email")
    ? `${(first || "user").toLowerCase().replace(/\s/g, "")}.${(last || "name").toLowerCase().replace(/\s/g, "")}@${pick(DOMAINS)}`
    : "";
  const phone = include.has("phone")
    ? `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
    : "";
  const street = pick(STREETS);
  const city = pick(CITIES);
  const state = pick(STATES);
  const zip = pick(ZIPS);
  const country = pick(COUNTRIES);
  const address = include.has("address")
    ? `${street}, ${city}, ${state} ${zip}, ${country}`
    : "";
  return { firstName: first, lastName: last, email, phone, address };
}

function formatAll(data: ReturnType<typeof generateOne>): string {
  const lines: string[] = [];
  if (data.firstName) lines.push(`First name: ${data.firstName}`);
  if (data.lastName) lines.push(`Last name: ${data.lastName}`);
  if (data.email) lines.push(`Email: ${data.email}`);
  if (data.phone) lines.push(`Phone: ${data.phone}`);
  if (data.address) lines.push(`Address: ${data.address}`);
  return lines.join("\n");
}

export default function FakeDataPage() {
  const [include, setInclude] = useState<Set<FieldId>>(new Set(["firstName", "lastName", "email", "phone", "address"]));
  const [data, setData] = useState<ReturnType<typeof generateOne> | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedField, setCopiedField] = useState<FieldId | null>(null);

  const toggle = useCallback((id: FieldId) => {
    setInclude((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onGenerate = useCallback(() => {
    setData(generateOne(include));
    setCopiedAll(false);
    setCopiedField(null);
  }, [include]);

  const copyAll = useCallback(() => {
    if (!data) return;
    const text = formatAll(data);
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }, [data]);

  const copyField = useCallback((field: FieldId, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline inline-block mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-6">Fake data generator</h1>
        <p className="text-muted-foreground mb-6">
          Generate fake names, emails, addresses, and phone numbers for testing.
        </p>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Include fields</p>
            <div className="flex flex-wrap gap-4">
              {FIELDS.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={include.has(id)}
                    onChange={() => toggle(id)}
                    className="border-input rounded"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="button" variant="cta" onClick={onGenerate}>
            Generate
          </Button>
          {data && (
            <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-4">
              {include.has("firstName") && data.firstName && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground text-sm">First name</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground">{data.firstName}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => copyField("firstName", data.firstName)}>
                      {copiedField === "firstName" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
              {include.has("lastName") && data.lastName && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground text-sm">Last name</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground">{data.lastName}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => copyField("lastName", data.lastName)}>
                      {copiedField === "lastName" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
              {include.has("email") && data.email && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground text-sm">Email</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground text-sm break-all">{data.email}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => copyField("email", data.email)}>
                      {copiedField === "email" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
              {include.has("phone") && data.phone && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground text-sm">Phone</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground">{data.phone}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => copyField("phone", data.phone)}>
                      {copiedField === "phone" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
              {include.has("address") && data.address && (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-muted-foreground text-sm">Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground text-sm">{data.address}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => copyField("address", data.address)}>
                      {copiedField === "address" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
              {formatAll(data) && (
                <Button type="button" variant="secondary" onClick={copyAll} className="mt-2">
                  {copiedAll ? "Copied all" : "Copy all"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
