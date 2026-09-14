// @vitest-environment node
import axios from "axios"
import { beforeAll, describe, expect, it } from "vitest"

const BASE_URL = "http://localhost:8080/api"

describe("Backend API Integration Tests", () => {
  let sessionCookie: string = ""

  // Authenticate before running suite
  beforeAll(async () => {
    const loginRes = await axios.post(`${BASE_URL}/auth/login/local`, {
      email: "admin@gmail.com",
      password: "123456",
    })
    expect(loginRes.status).toBe(200)
    expect(loginRes.data.code).toBe(0)
    const rawCookies = loginRes.headers["set-cookie"] || []
    sessionCookie = Array.isArray(rawCookies)
      ? rawCookies.join("; ")
      : rawCookies
  })

  describe("Authentication API (/api/auth)", () => {
    it("POST /api/auth/login/local should reject invalid credentials", async () => {
      try {
        await axios.post(`${BASE_URL}/auth/login/local`, {
          email: "admin@gmail.com",
          password: "wrong-password",
        })
        expect.unreachable("Should have thrown error on invalid password")
      } catch (err: any) {
        expect(err.response?.status).toBe(401)
      }
    })

    it("GET /api/auth/me should return authenticated user profile", async () => {
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(res.data.result.email).toBe("admin@gmail.com")
      expect(res.data.result.systemRole).toBe("SUPER_ADMIN")
    })
  })

  describe("Projects API (/api/projects & /api/zones)", () => {
    it("GET /api/projects should return project list with pagination meta", async () => {
      const res = await axios.get(`${BASE_URL}/projects`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
      expect(res.data.meta).toBeDefined()
      expect(res.data.meta.totalElements).toBeGreaterThan(0)
    })

    it("GET /api/zones should return zones list", async () => {
      const res = await axios.get(`${BASE_URL}/zones`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })
  })

  describe("Departments API (/api/departments)", () => {
    it("GET /api/departments should return list of departments", async () => {
      const res = await axios.get(`${BASE_URL}/departments`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })
  })

  describe("Roles API (/api/roles)", () => {
    it("GET /api/roles should return list of roles", async () => {
      const res = await axios.get(`${BASE_URL}/roles`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })

    it("GET /api/roles/tree should return hierarchical role tree", async () => {
      const res = await axios.get(`${BASE_URL}/roles/tree`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })
  })

  describe("Users API (/api/users)", () => {
    it("GET /api/users should return list of users with pagination meta", async () => {
      const res = await axios.get(`${BASE_URL}/users`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
      expect(res.data.meta).toBeDefined()
    })

    it("GET /api/users/tree should return hierarchical user organizational tree", async () => {
      const res = await axios.get(`${BASE_URL}/users/tree`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })
  })

  describe("Task Groups & Items API (/api/task-groups & /api/task-items)", () => {
    it("GET /api/task-groups should return task group categories", async () => {
      const res = await axios.get(`${BASE_URL}/task-groups`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })

    it("GET /api/task-items/tree should return task hierarchy tree", async () => {
      const res = await axios.get(`${BASE_URL}/task-items/tree`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })
  })

  describe("Business Matrix API (/api/business-matrix)", () => {
    it("GET /api/business-matrix should return business task-role matrix", async () => {
      const res = await axios.get(`${BASE_URL}/business-matrix`, {
        headers: { Cookie: sessionCookie },
      })
      expect(res.status).toBe(200)
      expect(res.data.code).toBe(0)
      expect(Array.isArray(res.data.result)).toBe(true)
    })
  })
})
