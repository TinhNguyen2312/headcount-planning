"use client"

import { Form, Modal, Tabs } from "antd"
import { Calendar, Layers, SlidersHorizontal, Users } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { milestoneQueries } from "@/hooks/server/milestones"
import { propertyQueries } from "@/hooks/server/properties"
import { roleQueries } from "@/hooks/server/roles"
import { standardQueries } from "@/hooks/server/standards"
import { applyApiFieldErrors } from "@/lib/errors"
import type {
  HeadcountStandardCreatePayload,
  HeadcountStandardResponse,
  HeadcountStandardUpdatePayload,
} from "@/types"
import { StandardCriteriaTab } from "./StandardCriteriaTab"
import { StandardGeneralTab } from "./StandardGeneralTab"
import { StandardMonthlyFactorsTab } from "./StandardMonthlyFactorsTab"

export interface StandardModalProps {
  open: boolean
  onCancel: () => void
  standard?: HeadcountStandardResponse | null
}

export const StandardModal: React.FC<StandardModalProps> = ({
  open,
  onCancel,
  standard,
}) => {
  const isEdit = Boolean(standard)
  const createMutation = standardQueries.useCreate()
  const updateMutation = standardQueries.useUpdate()

  const { data: roles = [] } = roleQueries.useList({ limit: 500 })
  const { data: milestones = [] } = milestoneQueries.useList({ limit: 500 })
  const { data: properties = [] } = propertyQueries.useList({ limit: 500 })

  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState("general")

  const roleOptions = useMemo(
    () =>
      roles.map((r) => ({
        value: r.id,
        label: `${r.name}`,
      })),
    [roles],
  )

  const milestoneOptions = useMemo(
    () =>
      milestones.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.code})`,
      })),
    [milestones],
  )

  const propertyOptions = useMemo(
    () =>
      properties.map((p) => ({
        value: p.id,
        label: `${p.name}${p.unit ? ` [${p.unit}]` : ""}`,
      })),
    [properties],
  )

  useEffect(() => {
    if (open) {
      setActiveTab("general")
      if (standard) {
        const dur = standard.durationMonths
          ? Number(standard.durationMonths)
          : 12
        const rawFactors = Array.isArray(standard.monthlyFactors)
          ? standard.monthlyFactors.map(Number)
          : []
        const factors =
          rawFactors.length > 0 ? rawFactors : Array(dur).fill(1.0)

        form.setFieldsValue({
          roleId: standard.roleId,
          fromMilestoneId: standard.fromMilestoneId,
          toMilestoneId: standard.toMilestoneId ?? undefined,
          headcount: standard.headcount,
          headcountMin: standard.headcountMin,
          headcountMax: standard.headcountMax,
          note: standard.note ?? "",
          durationMonths: dur,
          monthlyFactors: factors,
          criteria: (standard.criteria || []).map((c) => ({
            propertyId: c.propertyId,
            conditionOperator: c.conditionOperator,
            minValue: c.minValue,
            maxValue: c.maxValue,
            valueText: c.valueText ?? "",
            note: c.note ?? "",
          })),
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          headcount: 1.0,
          durationMonths: 12,
          monthlyFactors: Array(12).fill(1.0),
          criteria: [],
        })
      }
    }
  }, [open, standard, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const dur = Number(values.durationMonths ?? 12)
      const rawFactors = Array.isArray(values.monthlyFactors)
        ? values.monthlyFactors.map(Number)
        : []
      let factors = [...rawFactors]
      if (factors.length < dur) {
        while (factors.length < dur) factors.push(1.0)
      } else if (factors.length > dur) {
        factors = factors.slice(0, dur)
      }

      const payload: HeadcountStandardCreatePayload = {
        roleId: values.roleId,
        fromMilestoneId: values.fromMilestoneId,
        toMilestoneId: values.toMilestoneId || null,
        headcount: Number(values.headcount),
        headcountMin:
          values.headcountMin !== undefined && values.headcountMin !== null
            ? Number(values.headcountMin)
            : null,
        headcountMax:
          values.headcountMax !== undefined && values.headcountMax !== null
            ? Number(values.headcountMax)
            : null,
        note: values.note?.trim() || null,
        durationMonths: dur,
        monthlyFactors: factors,
        criteria: (values.criteria || [])
          .filter((c: any) => c && c.propertyId)
          .map((c: any) => ({
            propertyId: c.propertyId,
            conditionOperator: c.conditionOperator,
            minValue:
              c.minValue !== undefined && c.minValue !== null
                ? Number(c.minValue)
                : null,
            maxValue:
              c.maxValue !== undefined && c.maxValue !== null
                ? Number(c.maxValue)
                : null,
            valueText: c.valueText?.trim() || null,
            note: c.note?.trim() || null,
          })),
      }

      if (isEdit && standard) {
        await updateMutation.mutateAsync({
          id: standard.id,
          data: payload as HeadcountStandardUpdatePayload,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      onCancel()
    } catch (error: any) {
      applyApiFieldErrors(form, error)
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          <span>
            {isEdit
              ? `Chỉnh sửa định biên chuẩn: ${standard?.role?.name}`
              : "Thêm khung định biên chuẩn mới"}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
      width={1200}
      okText={isEdit ? "Lưu thay đổi" : "Tạo mới"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" className="mt-3">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "general",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="size-4" />
                  Thông tin chung
                </span>
              ),
              children: (
                <StandardGeneralTab
                  roleOptions={roleOptions}
                  milestoneOptions={milestoneOptions}
                />
              ),
            },
            {
              key: "criteria",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <SlidersHorizontal className="size-4" />
                  Điều kiện lọc
                </span>
              ),
              children: (
                <StandardCriteriaTab form={form} properties={properties} />
              ),
            },
            {
              key: "factors",
              label: (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="size-4" />
                  Phân bổ theo tháng
                </span>
              ),
              children: <StandardMonthlyFactorsTab form={form} />,
            },
          ]}
        />
      </Form>
    </Modal>
  )
}

export default StandardModal
