import { Modal, Radio } from "antd"
import { Building2, ShieldCheck } from "lucide-react"

import type { ProjectSummary } from "@/types"

interface ProjectRoleSelectionModalProps {
  step: "project" | "role"
  projectChoices: { id: number; name: string }[]
  roleChoices: ProjectSummary[]
  onSelectProject: (projectId: number) => void
  onSelectRole: (roleId: number) => void
}

export const ProjectRoleSelectionModal = ({
  step,
  projectChoices,
  roleChoices,
  onSelectProject,
  onSelectRole,
}: ProjectRoleSelectionModalProps) => {
  return (
    <Modal
      open
      closable={false}
      mask={{ closable: false }}
      keyboard={false}
      footer={null}
      centered
      title={
        step === "project" ? "Chọn dự án làm việc" : "Chọn vai trò làm việc"
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Tài khoản của bạn được gán vào nhiều{" "}
          {step === "project" ? "dự án" : "vai trò"}. Vui lòng chọn 1 để tiếp
          tục
          <p className="text-sm text-muted-foreground">
            Bạn có thể đổi lại sau trong Cài đặt tài khoản.
          </p>
        </p>

        {step === "project" ? (
          <Radio.Group
            className="flex! flex-col! gap-2!"
            onChange={(e) => onSelectProject(e.target.value)}
          >
            {projectChoices.map((p) => (
              <Radio
                key={p.id}
                value={p.id}
                className="flex items-center rounded-lg border border-border p-3 mt-1!"
              >
                <span className="inline-flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  {p.name}
                </span>
              </Radio>
            ))}
          </Radio.Group>
        ) : (
          <Radio.Group
            className="flex flex-col gap-2"
            onChange={(e) => onSelectRole(e.target.value)}
          >
            {roleChoices.map((r) => (
              <Radio
                key={r.roleId}
                value={r.roleId}
                className="flex items-center rounded-lg border border-border p-3"
              >
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  {r.roleName || r.projectRole}
                </span>
              </Radio>
            ))}
          </Radio.Group>
        )}
      </div>
    </Modal>
  )
}

export default ProjectRoleSelectionModal
