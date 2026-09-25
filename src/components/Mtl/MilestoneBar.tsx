"use client";

import React from "react";
import { Tooltip, Tag } from "antd";
import { Calendar, Flag, Sparkles } from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import { KEY_MILESTONES } from "@/lib/mtl/mtl-milestones";
import { formatDate } from "@/lib/utils";

export const MilestoneBar: React.FC = () => {
  const { getActiveProject } = useMtlStore();
  const { setMilestoneModalOpen } = useMtlUiStore();
  const activeProject = getActiveProject();

  if (!activeProject) return null;

  const milestoneDates = activeProject.milestoneDates || {};
  // Highlight core milestones: Khởi công (MILE_PCD_01), Cất nóc (MILE_PCD_04), Hoàn thành XD (MILE_PCD_07), Bàn giao (MILE_OM_02)
  const keyDisplayCodes = ["MILE_PLP_05", "MILE_PCD_01", "MILE_COM_02", "MILE_PCD_04", "MILE_OM_02"];
  const displayMilestones = KEY_MILESTONES.filter((m) => keyDisplayCodes.includes(m.code));

  return (
    <div className="bg-card/70 border-b border-border px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto text-xs">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Flag className="w-3.5 h-3.5 text-primary" />
        <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wide">
          Các mốc trọng yếu (Key Milestones):
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto py-0.5">
        {displayMilestones.map((m) => {
          const dateVal = milestoneDates[m.code];
          return (
            <Tooltip key={m.code} title={`${m.name} (${m.group})`}>
              <div
                onClick={() => setMilestoneModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border cursor-pointer transition-all ${
                  dateVal
                    ? "bg-primary/5 border-primary/30 text-foreground hover:border-primary"
                    : "bg-muted/40 border-dashed border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="font-medium text-[11px] truncate max-w-[120px]">{m.name}</span>
                <span className={`text-[11px] font-semibold ${dateVal ? "text-primary" : "text-muted-foreground/60"}`}>
                  {dateVal ? formatDate(dateVal) : "Chưa đặt"}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setMilestoneModalOpen(true)}
        className="text-xs text-primary hover:underline font-medium flex-shrink-0 flex items-center gap-1 ml-auto"
      >
        <Sparkles className="w-3 h-3" />
        Tất cả mốc ({Object.keys(milestoneDates).filter((k) => Boolean(milestoneDates[k])).length}/{KEY_MILESTONES.length})
      </button>
    </div>
  );
};
