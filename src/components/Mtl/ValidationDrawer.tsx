"use client";

import React, { useMemo } from "react";
import { Drawer, Alert, Tag, List, Button } from "antd";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, UserX } from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import { scheduleTasks } from "@/lib/mtl/mtl-calculations";

export const ValidationDrawer: React.FC = () => {
  const { getActiveProject } = useMtlStore();
  const { isValidationDrawerOpen, setValidationDrawerOpen, setSelectedTaskCode } = useMtlUiStore();
  const activeProject = getActiveProject();

  const tasks = useMemo(() => {
    if (!activeProject) return [];
    return scheduleTasks(activeProject);
  }, [activeProject]);

  const conflicts = useMemo(() => {
    return tasks.filter((t) => Boolean(t.dependencyConflict));
  }, [tasks]);

  const lateTasks = useMemo(() => {
    return tasks.filter((t) => t.actualStatus === "Trễ hạn");
  }, [tasks]);

  const missingPicTasks = useMemo(() => {
    return tasks.filter((t) => !t.summary && !t.pic);
  }, [tasks]);

  if (!activeProject) return null;

  return (
    <Drawer
      open={isValidationDrawerOpen}
      onClose={() => setValidationDrawerOpen(false)}
      title={
        <div className="flex items-center gap-2 text-base font-bold">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span>Kiểm tra & Xác thực Master Timeline (Pre-flight Validation)</span>
        </div>
      }
      width={560}
    >
      <div className="space-y-4">
        {conflicts.length === 0 && lateTasks.length === 0 ? (
          <Alert
            message="Kế hoạch hoàn toàn hợp lệ"
            description="Không phát hiện xung đột phụ thuộc hoặc công việc trễ hạn nghiêm trọng."
            type="success"
            showIcon
          />
        ) : (
          <Alert
            message={`Phát hiện ${conflicts.length} xung đột liên kết và ${lateTasks.length} công việc trễ hạn`}
            description="Vui lòng kiểm tra và xử lý các vấn đề trước khi chuyển sang bước thẩm định GMS.P."
            type="warning"
            showIcon
          />
        )}

        {/* Section 1: Conflicts */}
        <div>
          <h4 className="font-semibold text-xs mb-2 uppercase text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Xung đột liên kết phụ thuộc ({conflicts.length}):
          </h4>
          {conflicts.length === 0 ? (
            <div className="text-xs text-muted-foreground p-3 border border-border rounded-md bg-muted/10">
              Không có xung đột liên kết phụ thuộc.
            </div>
          ) : (
            <List
              size="small"
              bordered
              dataSource={conflicts}
              renderItem={(item) => (
                <List.Item
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => {
                    setSelectedTaskCode(item.code);
                    setValidationDrawerOpen(false);
                  }}
                >
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{item.code}</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <div className="text-[11px] text-amber-600">{item.dependencyConflict}</div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Section 2: Late tasks */}
        <div>
          <h4 className="font-semibold text-xs mb-2 uppercase text-red-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Công việc trễ hạn ({lateTasks.length}):
          </h4>
          {lateTasks.length === 0 ? (
            <div className="text-xs text-muted-foreground p-3 border border-border rounded-md bg-muted/10">
              Không có công việc nào bị trễ hạn.
            </div>
          ) : (
            <List
              size="small"
              bordered
              dataSource={lateTasks.slice(0, 8)}
              renderItem={(item) => (
                <List.Item
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => {
                    setSelectedTaskCode(item.code);
                    setValidationDrawerOpen(false);
                  }}
                >
                  <div className="text-xs flex items-center justify-between w-full">
                    <div className="truncate pr-2">
                      <span className="font-mono font-semibold mr-1.5">{item.code}</span>
                      <span>{item.name}</span>
                    </div>
                    <Tag color="error">Trễ hạn</Tag>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Section 3: Missing PIC */}
        <div>
          <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground flex items-center gap-1.5">
            <UserX className="w-4 h-4" />
            Công việc chưa gán người thực hiện ({missingPicTasks.length}):
          </h4>
          <div className="text-xs text-muted-foreground p-2 border border-border rounded-md bg-muted/10">
            Có <b>{missingPicTasks.length}</b> công việc chưa có PIC. Hệ thống khuyến nghị gán đầy đủ người
            thực hiện trước khi bàn giao sang PBCM.
          </div>
        </div>
      </div>
    </Drawer>
  );
};
