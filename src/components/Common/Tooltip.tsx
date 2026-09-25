import React from "react";

export function Tooltip({
  content,
  align = "left",
  className,
  children,
}: {
  content: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`group/tip relative inline-flex ${className ?? ""}`}>
      {children}

      <span
        role="tooltip"
        className={`pointer-events-none invisible absolute bottom-full z-50
                    mb-2 w-max min-w-40 max-w-72 rounded-lg bg-card border border-border p-3 text-left
                    opacity-0 shadow-lg transition-opacity duration-200
                    group-hover/tip:visible group-hover/tip:opacity-100
                    ${align === "right" ? "right-0" : "left-0"}`}
      >
        {content}
      </span>
    </span>
  );
}

export function TipTitle({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-semibold text-foreground">{children}</span>;
}

export function TipText({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
      {children}
    </span>
  );
}

export function TipMeta({ children }: { children: React.ReactNode }) {
  return <span className="mt-1.5 block text-xs text-muted-foreground/80">{children}</span>;
}
