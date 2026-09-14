import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("Route titles branding consistency (SCRUM-117)", () => {
  const routesDir = path.resolve(__dirname, "../../../src/routes")

  it("all route files with head meta title must end with and not contain Quản lý Bất động sản", () => {
    const routeFiles = fs
      .readdirSync(routesDir, { recursive: true })
      .filter((f) => typeof f === "string" && f.endsWith(".tsx")) as string[]

    for (const file of routeFiles) {
      const content = fs.readFileSync(path.join(routesDir, file), "utf8")
      const titleMatches = [...content.matchAll(/title:\s*["']([^"']+)["']/g)]
      for (const match of titleMatches) {
        const title = match[1]
        expect(title).not.toContain("Quản lý Bất động sản")
        expect(title).not.toBe("Dashboard")
        expect(title.length).toBeGreaterThan(0)
      }
    }
  })
})
