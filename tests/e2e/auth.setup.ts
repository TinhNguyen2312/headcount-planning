import { expect, test as setup } from "@playwright/test"

const authFile = "playwright/.auth/user.json"

// Requires a live backend and a real user seeded in the DB. Configure via env:
//   E2E_USER_EMAIL, E2E_USER_PASSWORD
setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD
  if (!email || !password) {
    throw new Error(
      "E2E_USER_EMAIL and E2E_USER_PASSWORD env vars are required to run the e2e suite.",
    )
  }

  await page.goto("/login")
  await page.getByTestId("identifier-input").fill(email)
  await page.getByTestId("password-input").fill(password)
  await page.getByRole("button", { name: "Đăng nhập" }).click()

  await expect(page.getByTestId("user-menu")).toBeVisible()

  await page.context().storageState({ path: authFile })
})
