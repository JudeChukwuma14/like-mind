"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type CooperativeSelectionContextValue = {
  selectedId: string;
  selectCooperative: (id: string) => void;
};

const CooperativeSelectionContext = createContext<CooperativeSelectionContextValue | null>(null);

/** Kept only while this admin layout is mounted; never persisted across sign-ins. */
export function CooperativeSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, selectCooperative] = useState("");
  return <CooperativeSelectionContext.Provider value={{ selectedId, selectCooperative }}>{children}</CooperativeSelectionContext.Provider>;
}

export function useSelectedCooperative() {
  const context = useContext(CooperativeSelectionContext);
  if (!context) throw new Error("CooperativeSelectionProvider is missing.");
  return context;
}
