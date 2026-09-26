import { Button, Empty, Modal, Select } from "antd"
import { Plus, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

import AccConditionOperatorSelect from "@/components/BusinessMatrix/AccConditionOperatorSelect"
import AccConditionRuleRow from "@/components/BusinessMatrix/AccConditionRuleRow"
import {
  ACC_FACTORS_CONFIG,
  type AccConditionBuilderState,
  type AccFactorType,
  buildAccConditionString,
  createDefaultRule,
  type LogicOperator,
  parseAccConditionString,
} from "@/components/BusinessMatrix/accConditionConfig"
import type { BusinessMatrixResponse } from "@/types"

interface AccConditionModalProps {
  open: boolean
  record: BusinessMatrixResponse
  isSaving?: boolean
  isEditing: boolean
  onClose: () => void
  onSave: (accCondition: string | null) => Promise<void> | void
}

export default function AccConditionModal({
  open,
  record,
  isSaving = false,
  isEditing,
  onClose,
  onSave,
}: AccConditionModalProps) {
  const [builderState, setBuilderState] = useState<AccConditionBuilderState>(
    () =>
      parseAccConditionString(record.accCondition) || {
        factor: "submittal",
        rules: [],
      },
  )

  const currentFactorConfig = ACC_FACTORS_CONFIG[builderState.factor]

  const handleFactorChange = (newFactor: AccFactorType) => {
    setBuilderState({
      factor: newFactor,
      rules: [],
    })
  }

  const handleAddRule = () => {
    if (currentFactorConfig.fields.length === 0) return
    const defaultField = currentFactorConfig.fields[0]?.key || "type"
    setBuilderState((prev) => ({
      ...prev,
      rules: [...prev.rules, createDefaultRule(defaultField)],
    }))
  }

  const handleFieldChange = (ruleId: string, field: string) => {
    setBuilderState((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === ruleId ? { ...r, field } : r)),
    }))
  }

  const handleValueChange = (ruleId: string, value: string) => {
    setBuilderState((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === ruleId ? { ...r, value } : r)),
    }))
  }

  const handleDeleteRule = (ruleId: string) => {
    setBuilderState((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== ruleId),
    }))
  }

  const handleOperatorChange = (ruleId: string, operator: LogicOperator) => {
    setBuilderState((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === ruleId ? { ...r, operator } : r)),
    }))
  }

  const handleSave = async () => {
    if (!record) return
    const compiled = buildAccConditionString(builderState)
    await onSave(compiled.trim())
  }

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-5 text-primary" />
          <span>Cấu hình ACC</span>
        </div>
      }
      onCancel={onClose}
      onOk={handleSave}
      okText="Lưu"
      cancelText="Hủy"
      width={640}
      confirmLoading={isSaving}
      destroyOnHidden
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 160px)",
          overflow: "auto",
          padding: "4px",
        },
      }}
    >
      <div className="flex flex-col gap-5 py-2">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <span className="text-muted-foreground">Nghiệp vụ áp dụng: </span>
          <span className="font-semibold text-foreground">
            {record.stt ? `${record.stt}. ` : ""}
            {record.title}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Đối tượng dữ liệu ACC
          </label>
          <Select<AccFactorType>
            value={builderState.factor}
            onChange={handleFactorChange}
            className="w-full"
            disabled={isSaving || isEditing}
            options={Object.values(ACC_FACTORS_CONFIG).map((factor) => ({
              value: factor.key,
              label: factor.label,
            }))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Điều kiện
            </label>
            <Button
              type="dashed"
              size="small"
              icon={<Plus className="size-3.5" />}
              onClick={handleAddRule}
              disabled={isSaving || currentFactorConfig.fields.length === 0}
            >
              Thêm điều kiện
            </Button>
          </div>

          {currentFactorConfig.fields.length === 0 ? (
            <div className="rounded-md border border-dashed py-6 text-center text-muted-foreground">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có trường lọc khả dụng cho đối tượng này (Đang chờ Backend hỗ trợ)."
              />
            </div>
          ) : builderState.rules.length === 0 ? (
            <div className="rounded-md border border-dashed py-6 text-center text-muted-foreground">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có điều kiện nào. Bấm nút phía trên để thêm điều kiện."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {builderState.rules.map((rule, idx) => (
                <div key={rule.id} className="flex flex-col gap-2">
                  <AccConditionRuleRow
                    rule={rule}
                    fields={currentFactorConfig.fields}
                    disabled={isSaving}
                    onFieldChange={(field) => handleFieldChange(rule.id, field)}
                    onValueChange={(val) => handleValueChange(rule.id, val)}
                    onDelete={() => handleDeleteRule(rule.id)}
                  />
                  {idx < builderState.rules.length - 1 && (
                    <AccConditionOperatorSelect
                      operator={rule.operator}
                      disabled={isSaving}
                      onChange={(op) => handleOperatorChange(rule.id, op)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
