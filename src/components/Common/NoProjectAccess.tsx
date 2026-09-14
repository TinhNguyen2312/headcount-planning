import { Button } from "antd"
import { Building2, LogOut, RefreshCw } from "lucide-react"
import useAuth from "@/hooks/useAuth"

interface NoProjectAccessProps {
  title?: string
  description?: string
}

export default function NoProjectAccess({
  title = "Chưa được phân công dự án",
  description = "Tài khoản của bạn hiện chưa được gán vào dự án hoặc phân khu nào. Vui lòng liên hệ Quản trị viên (Admin) để được cấp quyền truy cập.",
}: NoProjectAccessProps) {
  const { logout } = useAuth()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Building2 className="size-8 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="primary"
            icon={<RefreshCw className="size-4" />}
            onClick={handleRefresh}
          >
            Tải lại trang
          </Button>
          <Button icon={<LogOut className="size-4" />} onClick={() => logout()}>
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )
}
