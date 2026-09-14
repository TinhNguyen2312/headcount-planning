import { Building2, Users } from "lucide-react"

export interface ProjectGroupNodeData extends Record<string, unknown> {
  projectName: string
  userCount: number
  width: number
  height: number
}

interface ProjectGroupNodeProps {
  data: ProjectGroupNodeData
}

export const ProjectGroupNode = ({ data }: ProjectGroupNodeProps) => {
  const { projectName, userCount, width, height } = data

  return (
    <div
      style={{ width, height }}
      className="rounded-2xl border-2 border-dashed border-primary/30 bg-slate-50/50 dark:bg-slate-900/20 pointer-events-none relative"
    >
      <div className="absolute -top-5 left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-background border border-primary/30 shadow-xs">
        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <Building2 className="size-3.5" />
        </div>
        <span className="font-bold text-sm text-foreground uppercase tracking-tight">
          {projectName}
        </span>
        <div className="h-3.5 w-px bg-border mx-0.5" />
        <span className="text-base text-muted-foreground flex items-center gap-1 font-medium">
          <Users className="size-3" />
          {userCount} nhân sự
        </span>
      </div>
    </div>
  )
}

export default ProjectGroupNode
