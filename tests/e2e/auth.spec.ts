import { expect, test } from "@playwright/test"

// Runs unauthenticated (no storageState), independent of the "setup" project.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Authentication", () => {
  test("redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/my-task")
    await expect(page).toHaveURL(/\/login/)
  })

  test("logs in via the local login form", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD
    test.skip(!email || !password, "E2E_USER_EMAIL / E2E_USER_PASSWORD not set")

    await page.goto("/login")
    await page.getByTestId("identifier-input").fill(email as string)
    await page.getByTestId("password-input").fill(password as string)
    await page.getByRole("button", { name: "Đăng nhập" }).click()

    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.getByTestId("user-menu")).toBeVisible()
  })
})
