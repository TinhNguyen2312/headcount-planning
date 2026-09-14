import type { ReactNode } from "react"
import PageHeader, { type PageHeaderProps } from "./PageHeader"

export interface PageContainerProps extends PageHeaderProps {
  children?: ReactNode
  containerClassName?: string
}

export default function PageContainer({
  children,
  containerClassName = "flex flex-col gap-6",
  ...headerProps
}: PageContainerProps) {
  return (
    <div className={containerClassName}>
      <PageHeader {...headerProps} />
      {children}
    </div>
  )
}
