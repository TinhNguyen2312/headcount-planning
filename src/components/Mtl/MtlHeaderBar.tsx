"use client";

import React from "react";
import { Button, Select, Tag, Tooltip, Space } from "antd";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  Lock,
  RotateCcw,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import { formatDate } from "@/lib/utils";

export const MtlHeaderBar: React.FC = () => {
  const { projects, activeProjectId, setActiveProjectId, getActiveProject } = useMtlStore();
  const {
    setMilestoneModalOpen,
    setParameterDrawerOpen,
    setApprovalModalOpen,
    setImportModalOpen,
    setExportModalOpen,
    setValidationDrawerOpen,
  } = useMtlUiStore();

  const activeProject = getActiveProject();

  const getStatusTag = (status?: string, isLocked?: boolean) => {
    if (isLocked) {
      return (
        <Tag color="purple" icon={<Lock className="w-3 h-3 inline mr-1" />}>
          Baseline Đã khóa
        </Tag>
      );
    }
    switch (status) {
      case "approved":
        return (
          <Tag color="success" icon={<CheckCircle className="w-3 h-3 inline mr-1" />}>
            Đã duyệt chính thức
          </Tag>
        );
      case "appraised":
        return (
          <Tag color="blue" icon={<FileCheck className="w-3 h-3 inline mr-1" />}>
            Đã thẩm định GMS.P
          </Tag>
        );
      case "submitted":
        return (
          <Tag color="warning" icon={<Clock className="w-3 h-3 inline mr-1" />}>
            Chờ thẩm định GMS.P
          </Tag>
        );
      case "gmd_review":
        return (
          <Tag color="orange" icon={<Clock className="w-3 h-3 inline mr-1" />}>
            GMD kiểm soát
          </Tag>
        );
      case "changes_requested":
      case "gmd_returned":
        return (
          <Tag color="error" icon={<RotateCcw className="w-3 h-3 inline mr-1" />}>
            Yêu cầu chỉnh sửa
          </Tag>
        );
      default:
        return <Tag color="default">Đang lập (Draft)</Tag>;
    }
  };

  return (
    <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between gap-4 z-10">
      {/* Left: Project Selector & Info */}
      <div className="flex items-center gap-3 min-w-0">
        <Select
          value={activeProjectId ?? undefined}
          onChange={(val) => setActiveProjectId(val)}
          placeholder="Chọn dự án..."
          className="w-72"
          showSearch
          optionFilterProp="label"
          options={projects.map((p) => ({
            value: p.id,
            label: `[${p.code}] ${p.name}`,
          }))}
        />

        {activeProject && (
          <div className="hidden lg:flex items-center gap-2">
            {getStatusTag(activeProject.approvalStatus, activeProject.baselineLocked)}
            <span className="text-xs text-muted-foreground">
              {formatDate(activeProject.startDate)} → {formatDate(activeProject.targetDate)}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Space size={6}>
          <Tooltip title="Quản lý và điều chỉnh các mốc T0-T10">
            <Button
              icon={<CalendarDays className="w-4 h-4 text-emerald-600" />}
              onClick={() => setMilestoneModalOpen(true)}
              className="text-xs"
            >
              Mốc T0–T10
            </Button>
          </Tooltip>

          <Tooltip title="Tham số quy mô & tác động kế hoạch">
            <Button
              icon={<SlidersHorizontal className="w-4 h-4 text-blue-600" />}
              onClick={() => setParameterDrawerOpen(true)}
              className="text-xs"
            >
              Tham số dự án
            </Button>
          </Tooltip>

          <Tooltip title="Kiểm tra tính hợp lệ & cảnh báo xung đột WBS">
            <Button
              icon={<CheckCircle className="w-4 h-4 text-amber-600" />}
              onClick={() => setValidationDrawerOpen(true)}
              className="text-xs"
            >
              Kiểm tra MTL
            </Button>
          </Tooltip>

          <Tooltip title="Quy trình phê duyệt SOP06 (GMD / GMS.P / E-Approval)">
            <Button
              type="primary"
              icon={<FileCheck className="w-4 h-4" />}
              onClick={() => setApprovalModalOpen(true)}
              className="text-xs bg-primary hover:!bg-primary/90 font-medium"
            >
              Trình duyệt
            </Button>
          </Tooltip>

          <Tooltip title="Nhập tệp MS Project (.xml)">
            <Button
              icon={<Upload className="w-4 h-4" />}
              onClick={() => setImportModalOpen(true)}
              className="text-xs"
            />
          </Tooltip>

          <Tooltip title="Xuất dữ liệu Excel / MS Project">
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => setExportModalOpen(true)}
              className="text-xs"
            />
          </Tooltip>
        </Space>
      </div>
    </header>
  );
};
