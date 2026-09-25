import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DemoAccount,
  Project,
  TaskDependency,
  TaskEdit,
} from "@/types/mtl";
import type { MilestoneDates, MilestoneSources } from "@/lib/mtl/mtl-milestones";
import {
  DEMO_ACCOUNTS,
  DEFAULT_INITIAL_PROJECTS,
  STORAGE_KEY,
} from "@/constants/mtl";

interface MtlState {
  projects: Project[];
  activeProjectId: string | null;
  currentUser: DemoAccount | null;

  setProjects: (projects: Project[]) => void;
  setActiveProjectId: (id: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  updateTaskEdit: (projectId: string, taskCode: string, edit: Partial<TaskEdit>) => void;
  updateTaskDependencies: (projectId: string, taskCode: string, deps: TaskDependency[]) => void;
  updateMilestoneDates: (
    projectId: string,
    milestoneDates: MilestoneDates,
    milestoneSources?: MilestoneSources
  ) => void;

  setCurrentUser: (user: DemoAccount | null) => void;
  getActiveProject: () => Project | null;
}

export const useMtlStore = create<MtlState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      currentUser: DEMO_ACCOUNTS[0] ?? null,

      setProjects: (projects) => {
        set({ projects });
        if (!get().activeProjectId && projects.length > 0) {
          set({ activeProjectId: projects[0].id });
        }
      },

      setActiveProjectId: (id) => set({ activeProjectId: id }),

      addProject: (project) => {
        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: project.id,
        }));
      },

      updateProject: (id, partial) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...partial } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const nextProjects = state.projects.filter((p) => p.id !== id);
          const nextActiveId =
            state.activeProjectId === id
              ? nextProjects[0]?.id ?? null
              : state.activeProjectId;
          return {
            projects: nextProjects,
            activeProjectId: nextActiveId,
          };
        });
      },

      updateTaskEdit: (projectId, taskCode, edit) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const existing = p.taskEdits[taskCode] ?? {};
            return {
              ...p,
              taskEdits: {
                ...p.taskEdits,
                [taskCode]: { ...existing, ...edit },
              },
            };
          }),
        }));
      },

      updateTaskDependencies: (projectId, taskCode, deps) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              taskDependencies: {
                ...p.taskDependencies,
                [taskCode]: deps,
              },
            };
          }),
        }));
      },

      updateMilestoneDates: (projectId, milestoneDates, milestoneSources) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              milestoneDates: { ...p.milestoneDates, ...milestoneDates },
              milestoneSources: milestoneSources
                ? { ...p.milestoneSources, ...milestoneSources }
                : p.milestoneSources,
            };
          }),
        }));
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        if (!activeProjectId) return projects[0] ?? null;
        return projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        currentUser: state.currentUser,
      }),
    }
  )
);
