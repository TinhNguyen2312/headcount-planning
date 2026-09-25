"use client";

import React from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { PlusCircle } from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import { DEFAULT_PROJECT_PARAMETERS } from "@/lib/mtl/mtl-parameter-engine";
import { REGIONS, PROJECT_GROUPS, GROUPS, PBCM_GROUPS } from "@/constants/mtl";
import type { Project } from "@/types/mtl";

interface FormValues {
  name: string;
  code: string;
  type: string;
  investor?: string;
  location: string;
  region: string;
  group: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export const CreateProjectModal: React.FC = () => {
  const { addProject } = useMtlStore();
  const { isCreateProjectOpen, setCreateProjectOpen } = useMtlUiStore();
  const [form] = Form.useForm<FormValues>();

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const startDate = values.dateRange[0].format("YYYY-MM-DD");
      const targetDate = values.dateRange[1].format("YYYY-MM-DD");

      const selectedGroups = GROUPS.map((g) => g.code);
      const departmentApprovals = Object.fromEntries(
        PBCM_GROUPS.map((g) => [
          g.code,
          {
            reviewer: "",
            status: "pending" as const,
            note: "",
          },
        ])
      );

      const newProject: Project = {
        id: crypto.randomUUID(),
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.type,
        investor: values.investor?.trim() || "Tập đoàn Novaland",
        location: values.location.trim(),
        region: values.region,
        group: values.group,
        startDate,
        targetDate,
        parameters: { ...DEFAULT_PROJECT_PARAMETERS },
        parameterImpacts: [],
        milestoneDates: {},
        selectedGroups,
        createdAt: new Date().toISOString(),
        taskEdits: {},
        taskDependencies: {},
        customTasks: [],
        includedTaskCodes: [],
        departmentApprovals,
        approvalStatus: "draft",
        scheduleStatus: "in_progress",
      };

      addProject(newProject);
      message.success(`Đã khởi tạo dự án "${newProject.name}" thành công!`);
      form.resetFields();
      setCreateProjectOpen(false);
    });
  };

  return (
    <Modal
      open={isCreateProjectOpen}
      onCancel={() => setCreateProjectOpen(false)}
      onOk={handleCreate}
      title={
        <div className="flex items-center gap-2 text-base font-bold">
          <PlusCircle className="w-5 h-5 text-primary" />
          <span>Tạo Master Timeline Dự Án Mới</span>
        </div>
      }
      okText="Khởi tạo dự án"
      cancelText="Hủy"
      width={640}
      okButtonProps={{ className: "bg-primary hover:!bg-primary/90" }}
    >
      <Form
        form={form}
        layout="vertical"
        className="grid grid-cols-2 gap-x-4 pt-3"
        initialValues={{
          type: "Cao tầng (Chung cư/Thương mại)",
          investor: "Tập đoàn Novaland",
          region: REGIONS[0],
          group: PROJECT_GROUPS[2],
          dateRange: [dayjs(), dayjs().add(2, "year")],
        }}
      >
        <Form.Item
          name="name"
          label="Tên dự án"
          className="col-span-2"
          rules={[{ required: true, message: "Vui lòng nhập tên dự án" }]}
        >
          <Input placeholder="Ví dụ: Aqua City - Phoenix Island" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Mã dự án (WBS Code)"
          rules={[{ required: true, message: "Vui lòng nhập mã dự án" }]}
        >
          <Input placeholder="Ví dụ: NVL-AQH-2026" className="font-mono uppercase" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Loại hình dự án"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: "Cao tầng (Chung cư/Thương mại)", label: "Cao tầng (Chung cư/Thương mại)" },
              { value: "Thấp tầng/Biệt thự", label: "Thấp tầng/Biệt thự" },
              { value: "Khu phức hợp / Đô thị", label: "Khu phức hợp / Đô thị" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="location"
          label="Địa điểm / Tỉnh thành"
          rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
        >
          <Input placeholder="Ví dụ: Biên Hòa, Đồng Nai" />
        </Form.Item>

        <Form.Item name="region" label="Phân vùng" rules={[{ required: true }]}>
          <Select options={REGIONS.map((r) => ({ value: r, label: r }))} />
        </Form.Item>

        <Form.Item name="group" label="Nhóm dự án" rules={[{ required: true }]}>
          <Select options={PROJECT_GROUPS.map((g) => ({ value: g, label: g }))} />
        </Form.Item>

        <Form.Item name="investor" label="Chủ đầu tư">
          <Input placeholder="Ví dụ: Công ty Cổ phần Địa ốc Nova" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian thực hiện dự án"
          className="col-span-2"
          rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian" }]}
        >
          <DatePicker.RangePicker format="DD/MM/YYYY" className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
