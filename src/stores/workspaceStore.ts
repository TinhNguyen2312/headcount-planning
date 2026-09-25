"use client";

import { create } from "zustand";

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

interface WorkspaceState {
  currentWorkspace: string;
  workspaces: Workspace[];
  setWorkspace: (slug: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: "palm-marina",
  workspaces: [
    {
      id: "ws-1",
      slug: "palm-marina",
      name: "Khu Biệt Thự Palm Marina (DN-01)",
      description: "Dự án biệt thự ven sông Đồng Nai",
    },
    {
      id: "ws-2",
      slug: "aqua-city",
      name: "Khu Đô Thị Aqua City (Khu 1)",
      description: "Đô thị sinh thái thông minh",
    },
  ],
  setWorkspace: (slug: string) => set({ currentWorkspace: slug }),
}));
