"use client"

import React from "react"
import NextLink from "next/link"
import {
  useRouter,
  useSearchParams,
  useParams as useNextParams,
  usePathname,
} from "next/navigation"

export function useNavigate() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (options: any) => {
    if (typeof options === "function") {
      return
    }
    if (!options) return

    if (options.search && typeof options.search === "function") {
      const currentObj: Record<string, string> = {}
      searchParams.forEach((val, key) => {
        currentObj[key] = val
      })
      const nextObj = options.search(currentObj)
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(nextObj)) {
        if (v !== undefined && v !== null && v !== "") {
          params.set(k, String(v))
        }
      }
      router.push(`${pathname}?${params.toString()}`)
      return
    }

    let url = options.to || ""
    if (options.params) {
      for (const [k, v] of Object.entries(options.params)) {
        url = url.replace(`$${k}`, String(v))
      }
    }
    // Route mapping for PCD
    if (url.includes("/checklists")) {
      url = "/pcd?tab=checklists"
    } else if (url.includes("/my-task")) {
      url = "/pcd?tab=my-tasks"
    } else if (url.includes("/subordinates")) {
      url = "/pcd?tab=subordinates"
    } else if (url.includes("/create-adhoc")) {
      url = "/pcd?tab=adhoc"
    } else if (url.includes("/schedules")) {
      url = "/pcd?tab=schedules"
    }
    router.push(url)
  }
}

export function useSearch(opts?: { strict?: boolean }): any {
  const searchParams = useSearchParams()
  const obj: Record<string, any> = {}
  searchParams.forEach((val, key) => {
    obj[key] = val
  })
  return obj
}

export function useParams(_opts?: any): any {
  return useNextParams() || {}
}

export function Link({ to, params, search, children, className, ...props }: any) {
  let href = to || ""
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      href = href.replace(`$${k}`, String(v))
    }
  }
  return (
    <NextLink href={href} className={className} {...props}>
      {children}
    </NextLink>
  )
}
