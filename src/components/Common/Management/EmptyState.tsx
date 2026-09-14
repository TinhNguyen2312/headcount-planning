import { Button, Empty } from "antd"

export interface EmptyStateProps {
  emptyDescription: string
  helperText?: string
  actionText?: string
  onAction?: () => void
  buttonClassName?: string
}

export const EmptyState = ({
  emptyDescription,
  helperText,
  actionText,
  onAction,
  buttonClassName,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <Empty description={emptyDescription} className="max-w-md" />
      {helperText && (
        <p className="max-w-sm text-base text-muted-foreground">{helperText}</p>
      )}
      {actionText && onAction && (
        <Button
          type="primary"
          onClick={onAction}
          className={`mt-2 ${buttonClassName ?? ""}`}
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}
