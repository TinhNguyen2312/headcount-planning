"use client";

import { create } from "zustand";
import type { FindingStatus } from "@/constants/enums";

export interface FindingOverride {
  status?: FindingStatus;
  note?: string;
}

interface ReviewWorkspaceState {
  activePage: number;
  selectedFindingId: string | null;
  filterStatus: FindingStatus | "all";
  overrides: Record<string, FindingOverride>;
  zoomScale: number;
  setActivePage: (page: number) => void;
  setSelectedFindingId: (id: string | null) => void;
  setFilterStatus: (status: FindingStatus | "all") => void;
  setFindingOverride: (id: string, override: FindingOverride) => void;
  setZoomScale: (scale: number | ((prev: number) => number)) => void;
  resetWorkspace: () => void;
}

export const useReviewWorkspaceStore = create<ReviewWorkspaceState>((set) => ({
  activePage: 1,
  selectedFindingId: null,
  filterStatus: "all",
  overrides: {},
  zoomScale: 1.0,
  setActivePage: (page) => set({ activePage: page }),
  setSelectedFindingId: (id) => set({ selectedFindingId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFindingOverride: (id, override) =>
    set((state) => ({
      overrides: {
        ...state.overrides,
        [id]: {
          ...state.overrides[id],
          ...override,
        },
      },
    })),
  setZoomScale: (scale) =>
    set((state) => ({
      zoomScale: typeof scale === "function" ? scale(state.zoomScale) : scale,
    })),
  resetWorkspace: () =>
    set({
      activePage: 1,
      selectedFindingId: null,
      filterStatus: "all",
      overrides: {},
      zoomScale: 1.0,
    }),
}));
