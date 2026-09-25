"use client";

import React, { useMemo, useState } from "react";
import { Table, Tag, Input, Select, Button, Tooltip, Space, Badge } from "antd";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Search,
  User,
} from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import { scheduleTasks } from "@/lib/mtl/mtl-calculations";
import { formatDate } from "@/lib/utils";
import { GROUPS } from "@/constants/mtl";
import type { ScheduledTask } from "@/types/mtl";

export const WbsTreeGrid: React.FC = () => {
  const { getActiveProject } = useMtlStore();
  const { setSelectedTaskCode, selectedTaskCode } = useMtlUiStore();
  const activeProject = getActiveProject();

  const [searchText, setSearchText] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const tasks: ScheduledTask[] = useMemo(() => {
    if (!activeProject) return [];
    return scheduleTasks(activeProject);
  }, [activeProject]);

  const filteredTasks = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchSearch =
        !q ||
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.pic && t.pic.toLowerCase().includes(q));

      const matchGroup = selectedGroup === "all" || t.groupCode === selectedGroup;
      const matchLevel =
        levelFilter === "all" || String(t.level) === levelFilter;

      return matchSearch && matchGroup && matchLevel;
    });
  }, [tasks, searchText, selectedGroup, levelFilter]);

  const getStatusBadge = (status: ScheduledTask["actualStatus"]) => {
    switch (status) {
      case "Hoàn thành":
        return <Tag color="success">Hoàn thành</Tag>;
      case "Trễ hạn":
        return <Tag color="error">Trễ hạn</Tag>;
      case "Đang thực hiện":
        return <Tag color="processing">Đang thực hiện</Tag>;
      default:
        return <Tag color="default">Chưa bắt đầu</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã WBS",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (code: string, record: ScheduledTask) => {
        const indent = (record.level - 1) * 16;
        return (
          <div style={{ paddingLeft: `${indent}px` }} className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs ${
                record.summary ? "font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              {code}
            </span>
            {record.dependencyConflict && (
              <Tooltip title={record.dependencyConflict}>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Hạng mục công việc",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: ScheduledTask) => (
        <div
          className={`cursor-pointer ${
            record.summary ? "font-bold text-foreground" : "font-normal text-muted-foreground"
          }`}
          onClick={() => setSelectedTaskCode(record.code)}
        >
          <span className="text-xs hover:text-primary transition-colors">{name}</span>
          {record.notes && (
            <div className="text-[10px] text-muted-foreground/70 italic truncate max-w-md">
              {record.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: 90,
      align: "center" as const,
      render: (dur: number, record: ScheduledTask) => (
        <span className="text-xs">
          {record.summary ? "—" : dur > 0 ? `${dur} ngày` : "Mốc"}
        </span>
      ),
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 105,
      render: (date: string) => (
        <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
      ),
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 105,
      render: (date: string) => (
        <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
      ),
    },
    {
      title: "PIC",
      dataIndex: "pic",
      key: "pic",
      width: 120,
      render: (pic: string) => (
        <span className="text-xs truncate block max-w-[110px]" title={pic}>
          {pic || "—"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "actualStatus",
      key: "actualStatus",
      width: 120,
      render: (status: ScheduledTask["actualStatus"]) => getStatusBadge(status),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card">
      {/* Filter and Search Toolbar */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <Input
            prefix={<Search className="w-4 h-4 text-muted-foreground" />}
            placeholder="Tìm theo mã WBS, tên công việc, người thực hiện..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="text-xs"
          />

          <Select
            value={selectedGroup}
            onChange={setSelectedGroup}
            className="w-48 text-xs"
            options={[
              { value: "all", label: "Tất cả phòng ban (14)" },
              ...GROUPS.map((g) => ({
                value: g.code,
                label: `${g.code} · ${g.short}`,
              })),
            ]}
          />

          <Select
            value={levelFilter}
            onChange={setLevelFilter}
            className="w-28 text-xs"
            options={[
              { value: "all", label: "Tất cả cấp" },
              { value: "1", label: "Cấp 1" },
              { value: "2", label: "Cấp 2" },
              { value: "3", label: "Cấp 3" },
              { value: "4", label: "Cấp 4" },
            ]}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Hiển thị <b>{filteredTasks.length}</b> / {tasks.length} công việc
        </div>
      </div>

      {/* Main Tree Grid */}
      <div className="flex-1 overflow-auto">
        <Table
          dataSource={filteredTasks}
          columns={columns}
          rowKey="code"
          pagination={false}
          size="small"
          scroll={{ y: "calc(100vh - 240px)" }}
          rowClassName={(record) =>
            `${record.summary ? "bg-muted/10 font-semibold" : ""} ${
              selectedTaskCode === record.code ? "!bg-primary/10" : ""
            }`
          }
        />
      </div>
    </div>
  );
};
