import { hash, verify } from "@node-rs/argon2"
import bcrypt from "bcryptjs"

export async function verifyPassword(
  password: string,
  passwordHash: string | null | undefined,
): Promise<boolean> {
  if (!passwordHash) return false

  try {
    if (passwordHash.startsWith("$argon2")) {
      return await verify(passwordHash, password)
    }
    if (
      passwordHash.startsWith("$2a$") ||
      passwordHash.startsWith("$2b$") ||
      passwordHash.startsWith("$2y$")
    ) {
      return await bcrypt.compare(password, passwordHash)
    }
    // Fallback plain text check if any legacy demo data exists
    return password === passwordHash
  } catch (err) {
    console.error("Error verifying password:", err)
    return false
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password)
}
