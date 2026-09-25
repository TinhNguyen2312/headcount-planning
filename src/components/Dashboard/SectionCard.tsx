import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionCard({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel = "Xem tất cả",
  children,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 px-4 py-3 bg-muted/20">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 transition-colors"
          >
            {seeAllLabel}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </header>

      <div className={bodyClassName ?? "p-4"}>{children}</div>
    </section>
  );
}
