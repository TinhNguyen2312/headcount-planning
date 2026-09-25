"use client";

import { useState } from "react";
import { Modal, Switch, Alert } from "antd";
import { AlertCircle } from "lucide-react";
import {
  CATEGORY_CONFIG,
  categoryFromRuleIndex,
  CHECK_TYPE_CONFIG,
  CHECK_TYPE_ORDER,
  HOUSE_TYPE_CONFIG,
  HOUSE_TYPE_ORDER,
  OPERATOR_CONFIG,
  OPERATOR_ORDER,
} from "@/constants/domain";
import type {
  CheckType,
  ChtkCategory,
  ComparisonOperator,
  HouseType,
} from "@/constants/enums";
import { rulesService } from "@/services/rulesService";
import type { Rule } from "@/types";

const CONTROL_CLASS =
  "h-8.5 w-full rounded-md border border-border bg-surface-sunken/40 px-3 text-xs text-foreground " +
  "transition-colors duration-150 placeholder:text-muted-foreground/60 hover:border-border-strong " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

export function AddRuleModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (rule: Rule) => void;
}) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [checkType, setCheckType] = useState<CheckType | "">("");
  const [operator, setOperator] = useState<ComparisonOperator | "">("");
  const [value, setValue] = useState("");
  const [houseTypes, setHouseTypes] = useState<ReadonlySet<HouseType>>(
    new Set(HOUSE_TYPE_ORDER),
  );
  const [note, setNote] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewCategory: ChtkCategory | null =
    code.trim().length > 0 ? categoryFromRuleIndex(code.trim()) : null;

  const toggleHouseType = (type: HouseType) => {
    setHouseTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const isValid =
    code.trim().length > 0 &&
    title.trim().length > 0 &&
    checkType !== "" &&
    operator !== "" &&
    value.trim().length > 0 &&
    houseTypes.size > 0;

  const handleSubmit = async () => {
    if (!isValid || !checkType || !operator) {
      setError("Vui lòng điền đủ các trường bắt buộc trước khi thêm tiêu chí.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const rule = await rulesService.createRule({
        code: code.trim(),
        title: title.trim(),
        checkType,
        operator,
        value: value.trim(),
        houseTypes: Array.from(houseTypes),
        note: note.trim() || undefined,
        isActive,
      });
      onCreate(rule);
    } catch {
      setError("Không thể thêm tiêu chí mới. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={<span className="text-sm font-semibold">Thêm tiêu chí CHTK mới</span>}
      onCancel={onClose}
      width={560}
      footer={[
        <div key="footer" className="flex items-center justify-between w-full pt-2 border-t border-border/70">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onChange={setIsActive} size="small" />
            <span className="text-xs text-muted-foreground">Kích hoạt ngay</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
              className="h-8 px-3.5 rounded-md bg-foreground text-background text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Đang thêm..." : "Thêm tiêu chí"}
            </button>
          </div>
        </div>,
      ]}
    >
      <div className="space-y-3.5 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Mã tiêu chí <span className="text-red-500">*</span>
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ví dụ: 1.3.1"
              className={`numeric ${CONTROL_CLASS}`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Nhóm CHTK
            </label>
            <div className="h-8.5 flex items-center px-3 rounded-md border border-border bg-surface-sunken/40 text-xs text-muted-foreground">
              {previewCategory ? (
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className={`size-1.5 rounded-full ${CATEGORY_CONFIG[previewCategory].dot}`} />
                  {CATEGORY_CONFIG[previewCategory].label}
                </div>
              ) : (
                "Tự suy luận từ mã"
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Tên tiêu chí <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Chiều cao lan can ban công"
            className={CONTROL_CLASS}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Loại kiểm tra <span className="text-red-500">*</span>
            </label>
            <select
              value={checkType}
              onChange={(e) => setCheckType(e.target.value as CheckType | "")}
              className={CONTROL_CLASS}
            >
              <option value="">Chọn loại kiểm tra</option>
              {CHECK_TYPE_ORDER.map((t) => (
                <option key={t} value={t}>
                  {t}. {CHECK_TYPE_CONFIG[t].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Phép so sánh <span className="text-red-500">*</span>
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as ComparisonOperator | "")}
              className={CONTROL_CLASS}
            >
              <option value="">Chọn phép so sánh</option>
              {OPERATOR_ORDER.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_CONFIG[op].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Giá trị chuẩn / Yêu cầu <span className="text-red-500">*</span>
          </label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ví dụ: ≥ 1.1 m"
            className={`numeric ${CONTROL_CLASS}`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Loại nhà áp dụng <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {HOUSE_TYPE_ORDER.map((type) => {
              const config = HOUSE_TYPE_CONFIG[type];
              const isChecked = houseTypes.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleHouseType(type)}
                  className={`h-7.5 px-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                    isChecked
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {config.short}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Ghi chú diễn giải
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Lưu ý thêm cho kỹ sư khi kiểm tra"
            className="w-full resize-none rounded-md border border-border bg-surface-sunken/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>

        {error && (
          <Alert
            type="error"
            showIcon
            message={<span className="text-xs">{error}</span>}
            icon={<AlertCircle className="size-4" />}
          />
        )}
      </div>
    </Modal>
  );
}
