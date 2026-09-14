import { Button, Tooltip } from "antd"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Tooltip
      title={
        isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"
      }
    >
      <Button
        type="text"
        shape="circle"
        icon={isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Chuyển giao diện"
        data-testid="theme-button"
      />
    </Tooltip>
  )
}
