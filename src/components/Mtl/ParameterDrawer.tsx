"use client";

import React, { useEffect, useState } from "react";
import { Drawer, Form, InputNumber, Select, Button, Card, Table, Tag, message, Divider } from "antd";
import { CheckCircle2, SlidersHorizontal, AlertCircle } from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import {
  DEFAULT_PROJECT_PARAMETERS,
  generateParameterizedMTL,
  type ProjectParameters,
  type ParameterImpact,
} from "@/lib/mtl/mtl-parameter-engine";
import { TEMPLATE, DEFAULT_DEPENDENCIES } from "@/constants/mtl";

export const ParameterDrawer: React.FC = () => {
  const { getActiveProject, updateProject } = useMtlStore();
  const { isParameterDrawerOpen, setParameterDrawerOpen } = useMtlUiStore();
  const activeProject = getActiveProject();

  const [form] = Form.useForm<ProjectParameters>();
  const [impacts, setImpacts] = useState<ParameterImpact[]>([]);

  useEffect(() => {
    if (activeProject && isParameterDrawerOpen) {
      const initialParams = activeProject.parameters || { ...DEFAULT_PROJECT_PARAMETERS };
      form.setFieldsValue(initialParams);
      calculateImpacts(initialParams);
    }
  }, [activeProject, isParameterDrawerOpen, form]);

  const calculateImpacts = (params: ProjectParameters) => {
    try {
      const generated = generateParameterizedMTL(
        TEMPLATE,
        DEFAULT_DEPENDENCIES,
        params
      );
      setImpacts(generated.impacts);
    } catch {
      // ignore
    }
  };

  const handleValuesChange = (_: unknown, allValues: ProjectParameters) => {
    calculateImpacts(allValues);
  };

  const handleApply = () => {
    form.validateFields().then((values) => {
      if (!activeProject) return;
      const generated = generateParameterizedMTL(
        TEMPLATE,
        DEFAULT_DEPENDENCIES,
        values
      );

      updateProject(activeProject.id, {
        parameters: values,
        parameterImpacts: generated.impacts,
        customTasks: generated.tasks,
        taskEdits: { ...activeProject.taskEdits, ...generated.taskEdits },
      });

      message.success("Đã cập nhật tham số và tự động sinh lại WBS thành công!");
      setParameterDrawerOpen(false);
    });
  };

  const impactColumns = [
    {
      title: "Tham số",
      dataIndex: "parameter",
      key: "parameter",
      width: 140,
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Tiêu đề tác động",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: ParameterImpact) => (
        <div>
          <div className="font-semibold text-xs">{title}</div>
          <div className="text-[11px] text-muted-foreground">{record.detail}</div>
        </div>
      ),
    },
    {
      title: "Số task ảnh hưởng",
      dataIndex: "affectedTasks",
      key: "affectedTasks",
      width: 130,
      render: (count: number) => (
        <span className="font-semibold text-primary">{count} công việc</span>
      ),
    },
  ];

  return (
    <Drawer
      open={isParameterDrawerOpen}
      onClose={() => setParameterDrawerOpen(false)}
      title={
        <div className="flex items-center gap-2 text-base font-bold">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <span>Tham số Quy mô & Động cơ Sinh MTL</span>
        </div>
      }
      width={680}
      extra={
        <Button type="primary" onClick={handleApply} className="bg-primary hover:!bg-primary/90">
          Áp dụng & Sinh WBS
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>
            Các tham số dưới đây sẽ điều chỉnh tự động số lượng tháp, số tầng hầm, công việc thi công
            cọc vây, và số lượng công việc kiểm soát tương ứng trong Master Timeline.
          </span>
        </div>

        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          className="grid grid-cols-2 gap-x-4"
        >
          <Form.Item
            name="loaiHinhDuAn"
            label="Loại hình dự án"
            className="col-span-2"
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

          <Form.Item name="dienTichDat" label="Diện tích đất (m²)" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={100} formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
          </Form.Item>

          <Form.Item name="gfa" label="Tổng diện tích sàn GFA (m²)" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={100} formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
          </Form.Item>

          <Form.Item name="soThapBlock" label="Số tháp / Block" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={1} max={30} />
          </Form.Item>

          <Form.Item name="soTangHam" label="Số tầng hầm" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={0} max={6} />
          </Form.Item>

          <Form.Item name="soTangNoi" label="Số tầng nổi" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={1} max={80} />
          </Form.Item>

          <Form.Item name="soPhanKy" label="Số phân kỳ triển khai" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={1} max={10} />
          </Form.Item>
        </Form>

        <Divider className="my-2" />

        <div>
          <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground tracking-wider">
            Các tác động dự kiến vào cây WBS ({impacts.length}):
          </h4>
          <Table
            dataSource={impacts}
            columns={impactColumns}
            rowKey={(r) => `${r.parameter}-${r.title}`}
            pagination={false}
            size="small"
            className="border border-border rounded-lg overflow-hidden"
          />
        </div>
      </div>
    </Drawer>
  );
};
