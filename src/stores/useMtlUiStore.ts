import { create } from "zustand";

export type MtlViewMode =
  | "overview"
  | "workspace"
  | "design"
  | "fs"
  | "confirm"
  | "director_hub";

export type GanttZoomLevel = "day" | "week" | "month";

interface MtlUiState {
  view: MtlViewMode;
  sidebarCollapsed: boolean;
  zoomLevel: GanttZoomLevel;
  selectedTaskCode: string | null;
  activeWorkspaceTab: "wbs" | "gantt" | "validation" | "approvals" | "snapshots";

  // Modals and Drawers
  isCreateProjectOpen: boolean;
  isMilestoneModalOpen: boolean;
  isParameterDrawerOpen: boolean;
  isImportModalOpen: boolean;
  isExportModalOpen: boolean;
  isValidationDrawerOpen: boolean;
  isApprovalModalOpen: boolean;

  // Actions
  setView: (view: MtlViewMode) => void;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  setZoomLevel: (zoom: GanttZoomLevel) => void;
  setSelectedTaskCode: (code: string | null) => void;
  setActiveWorkspaceTab: (tab: "wbs" | "gantt" | "validation" | "approvals" | "snapshots") => void;

  setCreateProjectOpen: (open: boolean) => void;
  setMilestoneModalOpen: (open: boolean) => void;
  setParameterDrawerOpen: (open: boolean) => void;
  setImportModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setValidationDrawerOpen: (open: boolean) => void;
  setApprovalModalOpen: (open: boolean) => void;
}

export const useMtlUiStore = create<MtlUiState>((set) => ({
  view: "workspace",
  sidebarCollapsed: false,
  zoomLevel: "week",
  selectedTaskCode: null,
  activeWorkspaceTab: "wbs",

  isCreateProjectOpen: false,
  isMilestoneModalOpen: false,
  isParameterDrawerOpen: false,
  isImportModalOpen: false,
  isExportModalOpen: false,
  isValidationDrawerOpen: false,
  isApprovalModalOpen: false,

  setView: (view) => set({ view }),
  setSidebarCollapsed: (arg) =>
    set((state) => ({
      sidebarCollapsed: typeof arg === "function" ? arg(state.sidebarCollapsed) : arg,
    })),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setSelectedTaskCode: (selectedTaskCode) => set({ selectedTaskCode }),
  setActiveWorkspaceTab: (activeWorkspaceTab) => set({ activeWorkspaceTab }),

  setCreateProjectOpen: (isCreateProjectOpen) => set({ isCreateProjectOpen }),
  setMilestoneModalOpen: (isMilestoneModalOpen) => set({ isMilestoneModalOpen }),
  setParameterDrawerOpen: (isParameterDrawerOpen) => set({ isParameterDrawerOpen }),
  setImportModalOpen: (isImportModalOpen) => set({ isImportModalOpen }),
  setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
  setValidationDrawerOpen: (isValidationDrawerOpen) => set({ isValidationDrawerOpen }),
  setApprovalModalOpen: (isApprovalModalOpen) => set({ isApprovalModalOpen }),
}));
