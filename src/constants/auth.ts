export interface QuickLoginAccount {
  label: string
  role?: string
  email: string
  password: string
}

export const DEFAULT_QUICK_ACCOUNTS: QuickLoginAccount[] = [
  {
    label: "ADMIN",
    role: "SUPER_ADMIN",
    email: "admin@gmail.com",
    password: "123456",
  },
  {
    label: "GĐ/PGĐ",
    role: "PROJECT_ADMIN",
    email: "gmd.dn1.gdp.p3.1@novaland.com.vn",
    password: "12345678",
  },
  {
    label: "Trưởng phòng",
    role: "ZONE_ADMIN",
    email: "gmd.dn1.tp.p3.2.1@novaland.com.vn",
    password: "12345678",
  },
  {
    label: "Trưởng BP",
    role: "TASK_INSPECTOR",
    email: "gmd.dn1.tbp.p3.2.2@novaland.com.vn",
    password: "12345678",
  },
  {
    label: "Kỹ sư",
    role: "TASK_EXECUTOR",
    email: "gms.cg.3.4@novaland.com.vn",
    password: "12345678",
  },
]

export const getQuickLoginAccounts = (): QuickLoginAccount[] => {
  const isDevOrPreview =
    import.meta.env.DEV || import.meta.env.MODE !== "production"
  if (!isDevOrPreview) return []

  const rawAccounts = import.meta.env.VITE_QUICK_LOGIN_ACCOUNTS
  if (!rawAccounts) return DEFAULT_QUICK_ACCOUNTS

  try {
    const accounts: unknown = JSON.parse(rawAccounts)
    const parsed = Array.isArray(accounts)
      ? accounts.filter((acc): acc is QuickLoginAccount =>
          Boolean(acc?.label && acc.email && acc.password),
        )
      : []
    return parsed.length > 0 ? parsed : DEFAULT_QUICK_ACCOUNTS
  } catch {
    return DEFAULT_QUICK_ACCOUNTS
  }
}
