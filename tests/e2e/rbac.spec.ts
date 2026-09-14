import { expect, test } from "@playwright/test"

// Regression coverage for the SystemRole/ProjectRole mismatch bug: routes
// meant to be open to any authenticated user must not 403 just because
// systemRole isn't a project-role value, and SUPER_ADMIN-only routes must
// still redirect non-admins via the route-level beforeLoad guard.
//
// E2E_USER_IS_SUPER_ADMIN=true|false describes the logged-in test user
// (from auth.setup.ts) so the SUPER_ADMIN-only assertion can branch correctly.
test.describe("RBAC route access", () => {
  test("routes open to any authenticated user render normally", async ({
    page,
  }) => {
    await page.goto("/checklists")
    await expect(page).toHaveURL(/\/checklists/)
    await expect(page.getByTestId("user-menu")).toBeVisible()

    await page.goto("/staff")
    await expect(page).toHaveURL(/\/staff/)
  })

  test("SUPER_ADMIN-only route respects the test user's role", async ({
    page,
  }) => {
    const isSuperAdmin = process.env.E2E_USER_IS_SUPER_ADMIN === "true"

    await page.goto("/projects")

    if (isSuperAdmin) {
      await expect(page).toHaveURL(/\/projects/)
    } else {
      // requireSuperAdmin's beforeLoad redirects away before the page renders.
      await expect(page).not.toHaveURL(/\/projects$/)
    }
  })
})
