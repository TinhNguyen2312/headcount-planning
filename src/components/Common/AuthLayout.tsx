import { Card } from "antd"
import { Logo } from "@/components/Common/Logo"
import { ThemeToggle } from "@/components/Common/ThemeToggle"

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-svh flex-col bg-muted/40 dark:bg-zinc-950">
      <div className="flex justify-end p-1 pt-4 pr-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-sm border-t-4 border-t-primary">
          <div className="flex flex-col items-center gap-6">
            <Logo variant="full" className="h-16 w-auto" asLink={false} />
            <div className="flex w-full flex-col gap-1">{children}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
