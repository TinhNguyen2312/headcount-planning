import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}

const LOGO_SRC = "/novaland_logo.png"
const LOGO_ALT = "logo"

export const Logo = ({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) => {
  const content =
    variant === "responsive" ? (
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        className={cn("size-12 shrink-0", className)}
      />
    ) : (
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        className={cn(variant === "full" ? "h-16 w-auto" : "size-5", className)}
      />
    )

  if (!asLink) {
    return content
  }

  return <Link href="/projects">{content}</Link>
}
