import { Building2 } from "lucide-react"

export interface DepartmentGroupNodeData {
  title: string
  code?: string | null
  type?: string | null
  roleCount?: number
  width: number
  height: number
  theme?: "department" | "subdepartment"
  color?: string | null
}

export const DepartmentGroupNode = ({
  data,
}: {
  data: DepartmentGroupNodeData
}) => {
  const { title, code, width, height, theme = "department", color } = data

  const getThemeStyles = () => {
    switch (theme) {
      case "subdepartment":
        return {
          container:
            "border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/20",
          header:
            "bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 font-bold text-xs",
          badge:
            "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-bold",
        }
      case "department":
      default:
        return {
          container:
            "border-2 border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 shadow-xs",
          header:
            "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 font-bold text-xs",
          badge:
            "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 font-bold",
        }
    }
  }

  const styles = getThemeStyles()

  const customStyles = color
    ? {
        container: {
          borderColor: theme === "subdepartment" ? `${color}99` : `${color}77`,
          backgroundColor: `${color}0D`,
        },
        header: {
          backgroundColor: `${color}1E`,
          borderBottomColor: `${color}55`,
          color: color,
        },
        badge: {
          borderColor: `${color}77`,
          color: color,
          backgroundColor: "#ffffff",
        },
      }
    : null

  return (
    <div
      style={{ width, height, ...customStyles?.container }}
      className={`relative rounded-xl overflow-hidden pointer-events-none transition-all ${styles.container}`}
    >
      <div
        style={customStyles?.header}
        className={`px-3.5 py-2 flex items-center justify-between gap-2 select-none ${styles.header}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2
            className="size-4 shrink-0"
            style={{ color: color || undefined }}
          />
          <span
            className="font-bold text-xs uppercase tracking-wide whitespace-nowrap"
            style={{ color: color || undefined }}
            title={title}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          {code && (
            <span
              style={customStyles?.badge}
              className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${styles.badge}`}
            >
              {code}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DepartmentGroupNode
