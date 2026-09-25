"use client";

import React, { useMemo, useState } from "react";
import { Tooltip, Radio } from "antd";
import { Calendar, Flag, Sparkles } from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore, type GanttZoomLevel } from "@/stores/useMtlUiStore";
import { scheduleTasks } from "@/lib/mtl/mtl-calculations";
import { formatDate } from "@/lib/utils";
import type { ScheduledTask } from "@/types/mtl";

export const GanttChart: React.FC = () => {
  const { getActiveProject } = useMtlStore();
  const { zoomLevel, setZoomLevel, selectedTaskCode, setSelectedTaskCode } = useMtlUiStore();
  const activeProject = getActiveProject();

  const tasks: ScheduledTask[] = useMemo(() => {
    if (!activeProject) return [];
    return scheduleTasks(activeProject);
  }, [activeProject]);

  if (!activeProject) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card select-none">
      {/* Gantt Toolbar */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Chế độ phóng to thời gian:
          </span>
          <Radio.Group
            value={zoomLevel}
            onChange={(e) => setZoomLevel(e.target.value as GanttZoomLevel)}
            size="small"
          >
            <Radio.Button value="day">Ngày</Radio.Button>
            <Radio.Button value="week">Tuần</Radio.Button>
            <Radio.Button value="month">Tháng</Radio.Button>
          </Radio.Group>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-900 inline-block" />
            <span>Đang thực hiện</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-600 inline-block" />
            <span>Trễ hạn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-amber-500 inline-block" />
            <span>Mốc trọng yếu</span>
          </div>
        </div>
      </div>

      {/* Gantt Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Task Names */}
        <div className="w-80 border-r border-border overflow-y-auto flex-shrink-0 bg-card">
          <div className="h-9 px-3 border-b border-border bg-muted/40 flex items-center font-bold text-xs text-muted-foreground">
            Hạng mục công việc WBS
          </div>
          {tasks.map((task) => {
            const indent = (task.level - 1) * 12;
            const isSelected = selectedTaskCode === task.code;
            return (
              <div
                key={task.code}
                style={{ paddingLeft: `${indent + 8}px` }}
                onClick={() => setSelectedTaskCode(task.code)}
                className={`h-8 flex items-center gap-1.5 pr-2 border-b border-border/40 text-xs cursor-pointer truncate transition-colors ${
                  task.summary ? "font-semibold bg-muted/10" : "font-normal"
                } ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/30"}`}
              >
                <span className="font-mono text-[10px] text-muted-foreground flex-shrink-0">
                  {task.code}
                </span>
                <span className="truncate text-xs">{task.name}</span>
              </div>
            );
          })}
        </div>

        {/* Right Side: Timeline Bars */}
        <div className="flex-1 overflow-auto bg-slate-50 relative">
          {/* Header Time Axis */}
          <div className="h-9 border-b border-border bg-muted/40 sticky top-0 z-10 flex items-center px-4 justify-between text-xs text-muted-foreground">
            <span>Bắt đầu: {formatDate(activeProject.startDate)}</span>
            <span className="font-semibold text-primary">Biểu đồ tiến độ Master Timeline</span>
            <span>Kết thúc: {formatDate(activeProject.targetDate)}</span>
          </div>

          {/* Task Bars Rows */}
          <div className="relative">
            {tasks.map((task) => {
              const isSelected = selectedTaskCode === task.code;
              const isMilestone = task.duration === 0;

              let barColor = "bg-blue-900";
              if (task.actualStatus === "Hoàn thành") barColor = "bg-emerald-600";
              if (task.actualStatus === "Trễ hạn") barColor = "bg-red-600";

              return (
                <div
                  key={task.code}
                  className={`h-8 border-b border-border/40 relative flex items-center ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  {isMilestone ? (
                    <Tooltip
                      title={`${task.name}: ${formatDate(task.startDate)}`}
                      placement="top"
                    >
                      <div
                        style={{ left: `${task.left}%` }}
                        className="absolute w-3.5 h-3.5 -ml-1.5 rotate-45 bg-amber-500 shadow-sm border border-white cursor-pointer z-10"
                      />
                    </Tooltip>
                  ) : task.width > 0 ? (
                    <Tooltip
                      title={`${task.name} (${formatDate(task.startDate)} → ${formatDate(task.endDate)} - ${task.duration} ngày)`}
                      placement="top"
                    >
                      <div
                        style={{
                          left: `${task.left}%`,
                          width: `${Math.max(1, task.width)}%`,
                        }}
                        className={`absolute h-4 rounded-sm shadow-xs ${barColor} cursor-pointer hover:opacity-85 transition-opacity flex items-center px-1 text-[9px] text-white font-medium truncate`}
                      >
                        {task.width > 4 && <span className="truncate">{task.name}</span>}
                      </div>
                    </Tooltip>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
