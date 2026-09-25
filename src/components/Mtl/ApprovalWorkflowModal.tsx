"use client";

import React, { useState } from "react";
import { Modal, Steps, Button, Input, Tag, message, Divider } from "antd";
import { CheckCircle2, Clock, FileCheck, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore } from "@/stores/useMtlUiStore";
import type { ApprovalStatus } from "@/types/mtl";

export const ApprovalWorkflowModal: React.FC = () => {
  const { getActiveProject, updateProject, currentUser } = useMtlStore();
  const { isApprovalModalOpen, setApprovalModalOpen } = useMtlUiStore();
  const activeProject = getActiveProject();

  const [note, setNote] = useState("");

  if (!activeProject) return null;

  const currentStatus = activeProject.approvalStatus;

  const getStepCurrent = (status: ApprovalStatus) => {
    switch (status) {
      case "draft":
        return 0;
      case "gmd_review":
        return 1;
      case "submitted":
      case "changes_requested":
        return 2;
      case "appraised":
        return 3;
      case "approved":
        return 4;
      default:
        return 0;
    }
  };

  const handleAction = (nextStatus: ApprovalStatus, successMsg: string) => {
    updateProject(activeProject.id, {
      approvalStatus: nextStatus,
      reviewNote: note || undefined,
      isOfficialApproved: nextStatus === "approved",
      baselineLocked: nextStatus === "approved" ? true : activeProject.baselineLocked,
    });
    message.success(successMsg);
    setNote("");
    setApprovalModalOpen(false);
  };

  return (
    <Modal
      open={isApprovalModalOpen}
      onCancel={() => setApprovalModalOpen(false)}
      title={
        <div className="flex items-center gap-2 text-base font-bold">
          <FileCheck className="w-5 h-5 text-primary" />
          <span>Quy trình Thẩm định & Phê duyệt Master Timeline (SOP06)</span>
        </div>
      }
      footer={null}
      width={720}
    >
      <div className="py-3 space-y-5">
        <p className="text-xs text-muted-foreground">
          Dự án: <b className="text-foreground">{activeProject.name}</b> [{activeProject.code}]
        </p>

        {/* Steps display */}
        <Steps
          current={getStepCurrent(currentStatus)}
          items={[
            { title: "Lập MTL", description: "PMD chủ trì" },
            { title: "Kiểm soát", description: "GMD BĐHDA" },
            { title: "Thẩm định", description: "GMS.P" },
            { title: "E-Approval", description: "Trình ký số" },
            { title: "Khóa Baseline", description: "Duyệt chính thức" },
          ]}
        />

        <Divider className="my-2" />

        {/* Note Input */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">
            Ý kiến đánh giá / Ghi chú phê duyệt:
          </label>
          <Input.TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú hoặc lý do chuyển bước / yêu cầu điều chỉnh..."
            className="text-xs"
          />
        </div>

        {/* Action Buttons based on status */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          {currentStatus === "draft" && (
            <Button
              type="primary"
              className="bg-primary hover:!bg-primary/90"
              onClick={() => handleAction("gmd_review", "Đã gửi MTL tới GMD kiểm soát thành công!")}
            >
              Gửi GMD kiểm soát (Bước 6)
            </Button>
          )}

          {currentStatus === "gmd_review" && (
            <>
              <Button
                danger
                onClick={() => handleAction("draft", "Đã trả về PMD để hoàn thiện lại.")}
              >
                Yêu cầu sửa lại
              </Button>
              <Button
                type="primary"
                className="bg-primary hover:!bg-primary/90"
                onClick={() => handleAction("submitted", "Đã gửi GMS.P thẩm định thành công!")}
              >
                GMD Duyệt & Gửi GMS.P thẩm định (Bước 7)
              </Button>
            </>
          )}

          {currentStatus === "submitted" && (
            <>
              <Button
                danger
                onClick={() => handleAction("changes_requested", "Đã gửi yêu cầu chỉnh sửa.")}
              >
                GMS.P Yêu cầu chỉnh sửa
              </Button>
              <Button
                type="primary"
                className="bg-primary hover:!bg-primary/90"
                onClick={() => handleAction("appraised", "Đã xác nhận thẩm định đạt chuẩn!")}
              >
                GMS.P Thẩm định Đạt (Bước 8)
              </Button>
            </>
          )}

          {currentStatus === "appraised" && (
            <Button
              type="primary"
              className="bg-emerald-600 hover:!bg-emerald-700"
              onClick={() => handleAction("approved", "Đã phê duyệt chính thức và Khóa Baseline!")}
            >
              E-Approval Phê duyệt & Khóa Baseline (Bước 9-10)
            </Button>
          )}

          {currentStatus === "approved" && (
            <Tag color="success" className="px-3 py-1.5 text-xs font-semibold">
              Kế hoạch đã được phê duyệt và Khóa Baseline.
            </Tag>
          )}
        </div>
      </div>
    </Modal>
  );
};
