"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AppSearchContextValue {
  query: string;
  setQuery: (q: string) => void;
}

const AppSearchContext = createContext<AppSearchContextValue | null>(null);

export function AppSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  return (
    <AppSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </AppSearchContext.Provider>
  );
}

export function useAppSearch(): AppSearchContextValue {
  const ctx = useContext(AppSearchContext);
  if (!ctx) throw new Error("useAppSearch must be used within AppSearchProvider");
  return ctx;
}
