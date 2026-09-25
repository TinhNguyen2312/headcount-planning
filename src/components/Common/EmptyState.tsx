export function EmptyState({
  title,
  message = "Chưa có dữ liệu.",
  icon: Icon,
  action,
}: {
  title?: string;
  message?: string;
  icon?: (props: { className?: string }) => React.ReactElement;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {Icon && (
        <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-border/80 bg-muted/40 text-muted-foreground/70">
          <Icon className="size-5" />
        </div>
      )}
      {title && <h4 className="text-xs font-semibold text-foreground">{title}</h4>}
      <p className="max-w-xs text-xs text-muted-foreground mt-1">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

