"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Tabs } from "antd";
import { GanttChartSquare, ListTree, Users } from "lucide-react";
import { MilestoneBar } from "./MilestoneBar";
import { WbsTreeGrid } from "./WbsTreeGrid";
import { GanttChart } from "./GanttChart";
import { MilestoneModal } from "./MilestoneModal";
import { ParameterDrawer } from "./ParameterDrawer";
import { ApprovalWorkflowModal } from "./ApprovalWorkflowModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { ImportExportModal } from "./ImportExportModal";
import { ValidationDrawer } from "./ValidationDrawer";
import { useMtlUiStore } from "@/stores/useMtlUiStore";

export const WorkspaceView: React.FC = () => {
  const router = useRouter();
  const { activeWorkspaceTab, setActiveWorkspaceTab } = useMtlUiStore();

  const tabItems = [
    {
      key: "wbs",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <ListTree className="w-4 h-4 text-primary" />
          <span>Cây công việc WBS</span>
        </span>
      ),
      children: <WbsTreeGrid />,
    },
    {
      key: "gantt",
      label: (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <GanttChartSquare className="w-4 h-4 text-primary" />
          <span>Biểu đồ Gantt</span>
        </span>
      ),
      children: <GanttChart />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Key Milestones Strip */}
      <MilestoneBar />

      {/* Main Workspace Tabs */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pt-2">
        <Tabs
          activeKey={activeWorkspaceTab}
          onChange={(k) => setActiveWorkspaceTab(k as "wbs" | "gantt")}
          items={tabItems}
          className="flex-1 flex flex-col min-h-0 mtl-workspace-tabs"
          tabBarExtraContent={{
            right: (
              <Button
                size="small"
                icon={<Users className="w-3.5 h-3.5 text-primary" />}
                onClick={() => router.push("/headcount-reports")}
                className="text-xs font-semibold hover:border-primary"
              >
                Xem Định biên Nhân sự
              </Button>
            ),
          }}
        />
      </div>

      {/* Modals & Drawers */}
      <MilestoneModal />
      <ParameterDrawer />
      <ApprovalWorkflowModal />
      <CreateProjectModal />
      <ImportExportModal />
      <ValidationDrawer />
    </div>
  );
};
