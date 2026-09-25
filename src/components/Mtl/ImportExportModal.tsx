"use client";

import React, { useState } from "react";
import { Modal, Upload, Button, message, Tabs, Space } from "antd";
import { Download, FileSpreadsheet, FileText, Upload as UploadIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import { parseMSProjectXML } from "@/lib/mtl/xml-parser";
import { scheduleTasks } from "@/lib/mtl/mtl-calculations";
import { formatDate } from "@/lib/utils";
import type { TaskDependency, TaskEdit } from "@/types/mtl";

export const ImportExportModal: React.FC = () => {
  const { getActiveProject, updateProject } = useMtlStore();
  const { isImportModalOpen, setImportModalOpen, isExportModalOpen, setExportModalOpen } =
    useMtlUiStore();
  const activeProject = getActiveProject();

  const [loading, setLoading] = useState(false);

  // XML Import Handler
  const handleXmlFile = async (file: File) => {
    if (!activeProject) return false;
    setLoading(true);
    try {
      const text = await file.text();
      const parsed = await parseMSProjectXML(text);

      updateProject(activeProject.id, {
        customTasks: parsed.customTasks,
        taskEdits: parsed.taskEdits as Record<string, TaskEdit>,
        taskDependencies: parsed.taskDependencies as Record<string, TaskDependency[]>,
        parameterImpacts: [
          {
            parameter: "XML_IMPORT",
            title: "Khởi tạo từ Microsoft Project",
            detail: "Đã nhập thành công cây công việc và liên kết từ tệp MS Project XML.",
            affectedTasks: parsed.customTasks.length,
          },
        ],
      });

      message.success(`Đã nhập thành công ${parsed.customTasks.length} công việc từ MS Project!`);
      setImportModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Định dạng tệp XML không hợp lệ";
      message.error(msg);
    } finally {
      setLoading(false);
    }
    return false;
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    if (!activeProject) return;
    const tasks = scheduleTasks(activeProject);
    const data = tasks.map((t) => ({
      "Mã WBS": t.code,
      "Hạng mục công việc": t.name,
      "Thời lượng (ngày)": t.duration,
      "Ngày bắt đầu": formatDate(t.startDate),
      "Ngày kết thúc": formatDate(t.endDate),
      "Người thực hiện (PIC)": t.pic || "",
      "Trạng thái": t.actualStatus,
      "Ghi chú": t.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master Timeline");
    XLSX.writeFile(wb, `MTL_${activeProject.code}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    message.success("Đã xuất tệp Excel thành công!");
    setExportModalOpen(false);
  };

  return (
    <>
      {/* Import Modal */}
      <Modal
        open={isImportModalOpen}
        onCancel={() => setImportModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-base font-bold">
            <UploadIcon className="w-5 h-5 text-primary" />
            <span>Nhập dữ liệu kế hoạch (Import MS Project)</span>
          </div>
        }
        footer={null}
        width={540}
      >
        <div className="py-3 space-y-4">
          <p className="text-xs text-muted-foreground">
            Hỗ trợ nhập trực tiếp tệp <b>XML (.xml)</b> được xuất từ Microsoft Project. Toàn bộ mã WBS,
            liên kết phụ thuộc (FS, SS, FF) và ngày tháng sẽ được đồng bộ vào dự án hiện tại.
          </p>

          <Upload.Dragger
            accept=".xml"
            showUploadList={false}
            beforeUpload={handleXmlFile}
            disabled={loading}
            className="p-6"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <FileText className="w-10 h-10 text-primary/60" />
              <div className="font-semibold text-xs text-foreground">
                Kéo thả tệp XML vào đây hoặc bấm để chọn tệp
              </div>
              <div className="text-[11px] text-muted-foreground">
                Hỗ trợ Microsoft Project XML format (2016 / 2019 / 2021)
              </div>
            </div>
          </Upload.Dragger>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        open={isExportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-base font-bold">
            <Download className="w-5 h-5 text-primary" />
            <span>Xuất dữ liệu Master Timeline</span>
          </div>
        }
        footer={null}
        width={480}
      >
        <div className="py-3 space-y-4">
          <p className="text-xs text-muted-foreground">
            Chọn định dạng bạn muốn trích xuất dữ liệu của dự án <b>{activeProject?.name}</b>:
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button
              size="large"
              icon={<FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
              onClick={handleExportExcel}
              className="flex items-center justify-start h-14 text-xs font-semibold px-4"
            >
              <div className="text-left ml-2">
                <div>Xuất bảng tính Excel (.xlsx)</div>
                <div className="text-[10px] text-muted-foreground font-normal">
                  Đầy đủ mã WBS, ngày bắt đầu/kết thúc, PIC và trạng thái
                </div>
              </div>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
