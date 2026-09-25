import React from "react";

export function KpiCard({
  label,
  value,
  unit,
  valueTone = "text-foreground",
  description,
  footnote,
}: {
  label: string;
  value: string | number;
  unit?: string;
  valueTone?: string;
  description: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`numeric text-2xl font-bold tracking-tight ${valueTone}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
      </div>

      <div className="mt-2 text-xs text-muted-foreground leading-relaxed">{description}</div>
      {footnote && <div className="mt-1 text-[11px] text-muted-foreground/75 font-mono">{footnote}</div>}
    </div>
  );
}
