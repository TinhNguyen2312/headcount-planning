import Link from "next/link"

interface BrandHeaderProps {
  collapsed?: boolean
  onItemClick?: () => void
}

export const BrandHeader = ({
  collapsed = false,
  onItemClick,
}: BrandHeaderProps) => {
  if (collapsed) {
    return (
      <div className="flex shrink-0 items-center justify-center border-b border-sidebar-border/30 px-3 py-4">
        <Link
          href="/projects"
          onClick={onItemClick}
          className="flex flex-col items-center justify-center gap-1 py-1 transition-opacity hover:opacity-90"
        >
          <img
            src="/novaland_logo.png"
            alt="Novaland Logo"
            className="size-8 shrink-0 object-contain"
          />
          <span className="text-base font-black tracking-wider text-white">
            GMS.P
          </span>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center justify-center border-b border-sidebar-border/30 px-3 py-4">
      <Link
        href="/projects"
        onClick={onItemClick}
        className="flex flex-col items-center gap-2.5 transition-opacity hover:opacity-90"
      >
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Novaland Logo"
            className="mx-0.5 size-35 object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black leading-none tracking-tight text-white">
            GMS.P
          </span>
          <div className="flex flex-col justify-between text-[11px] font-bold uppercase leading-tight tracking-wider text-slate-300">
            <span>Project - GENERAL MANAGEMENT SYSTEM</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
