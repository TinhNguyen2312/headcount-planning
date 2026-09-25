"use client";

import React, { useEffect, useState } from "react";
import { Modal, DatePicker, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { Calendar, Flag, Sparkles } from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import { KEY_MILESTONES, MilestoneDefinition } from "@/lib/mtl/mtl-milestones";

export const MilestoneModal: React.FC = () => {
  const { getActiveProject, updateMilestoneDates } = useMtlStore();
  const { isMilestoneModalOpen, setMilestoneModalOpen } = useMtlUiStore();
  const activeProject = getActiveProject();

  const [datesState, setDatesState] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeProject?.milestoneDates) {
      setDatesState({ ...activeProject.milestoneDates });
    }
  }, [activeProject, isMilestoneModalOpen]);

  const handleDateChange = (code: string, dateString: string | string[] | null) => {
    let val = "";
    if (typeof dateString === "string") val = dateString;
    else if (Array.isArray(dateString) && dateString[0]) val = dateString[0];
    setDatesState((prev) => ({
      ...prev,
      [code]: val,
    }));
  };

  const handleSave = () => {
    if (!activeProject) return;
    updateMilestoneDates(activeProject.id, datesState);
    message.success("Đã cập nhật các mốc tiến độ dự án thành công!");
    setMilestoneModalOpen(false);
  };

  const columns = [
    {
      title: "Mã mốc",
      dataIndex: "code",
      key: "code",
      width: 130,
      render: (code: string) => <span className="font-mono text-xs font-semibold">{code}</span>,
    },
    {
      title: "Tên mốc tiến độ",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: MilestoneDefinition) => (
        <div>
          <div className="font-medium text-xs text-foreground">{name}</div>
          {record.mappedCode && (
            <div className="text-[10px] text-muted-foreground">WBS: {record.mappedCode}</div>
          )}
        </div>
      ),
    },
    {
      title: "Nhóm",
      dataIndex: "group",
      key: "group",
      width: 150,
      render: (group: string) => {
        const color =
          group === "Pháp lý" ? "blue" : group === "Thi công" ? "orange" : "green";
        return <Tag color={color}>{group}</Tag>;
      },
    },
    {
      title: "Ngày mốc",
      key: "date",
      width: 170,
      render: (_: unknown, record: MilestoneDefinition) => {
        const currentVal = datesState[record.code];
        return (
          <DatePicker
            value={currentVal ? dayjs(currentVal) : null}
            onChange={(_, dateStr) => handleDateChange(record.code, dateStr)}
            placeholder="Chọn ngày..."
            format="DD/MM/YYYY"
            className="w-full text-xs"
            allowClear
          />
        );
      },
    },
  ];

  return (
    <Modal
      open={isMilestoneModalOpen}
      onCancel={() => setMilestoneModalOpen(false)}
      onOk={handleSave}
      title={
        <div className="flex items-center gap-2 text-base font-bold">
          <Flag className="w-5 h-5 text-primary" />
          <span>Quản lý Mốc Tiến độ Trọng yếu (Key Milestones)</span>
        </div>
      }
      okText="Lưu thay đổi"
      cancelText="Đóng"
      width={780}
      okButtonProps={{ className: "bg-primary hover:!bg-primary/90" }}
    >
      <div className="py-2">
        <p className="text-xs text-muted-foreground mb-3">
          Thiết lập ngày cho các mốc chính của dự án <b>{activeProject?.name}</b>. Khi lưu, các
          công việc con tương ứng trong WBS sẽ được tính toán và neo theo ngày của mốc này.
        </p>

        <Table
          dataSource={KEY_MILESTONES}
          columns={columns}
          rowKey="code"
          pagination={false}
          size="small"
          scroll={{ y: 420 }}
          className="border border-border rounded-lg overflow-hidden"
        />
      </div>
    </Modal>
  );
};
