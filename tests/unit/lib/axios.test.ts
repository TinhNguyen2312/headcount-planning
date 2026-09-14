import { describe, expect, it } from "vitest"
import { axios } from "@/lib/axios"

describe("axios interceptors pagination mapping", () => {
  it("converts 1-based page query params to 0-based page in request", async () => {
    // Interceptor handlers can be verified via internal handler list
    const requestHandlers = (axios.interceptors.request as any).handlers
    const paginationInterceptor = requestHandlers.find((h: any) => h.fulfilled)

    const config = {
      headers: {},
      params: {
        page: 1,
        limit: 12,
        sortBy: "createdAt",
        order: "DESC",
      },
    }

    const modified = paginationInterceptor.fulfilled(config)
    expect(modified.params.page).toBe(0)
    expect(modified.params.limit).toBe(12)
  })

  it("converts string page query params to 0-based number in request", async () => {
    const requestHandlers = (axios.interceptors.request as any).handlers
    const paginationInterceptor = requestHandlers.find((h: any) => h.fulfilled)

    const config = {
      headers: {},
      params: {
        page: "2",
        limit: 10,
      },
    }

    const modified = paginationInterceptor.fulfilled(config)
    expect(modified.params.page).toBe(1)
  })

  it("sanitizes negative page to 0 and non-positive limit to default 10", async () => {
    const requestHandlers = (axios.interceptors.request as any).handlers
    const paginationInterceptor = requestHandlers.find((h: any) => h.fulfilled)

    const config = {
      headers: {},
      params: {
        page: -3,
        limit: 0,
      },
    }

    const modified = paginationInterceptor.fulfilled(config)
    expect(modified.params.page).toBe(0)
    expect(modified.params.limit).toBe(10)
  })

  it("normalizes Spring Boot PageResponse meta in response", () => {
    const responseHandlers = (axios.interceptors.response as any).handlers
    const responseInterceptor = responseHandlers.find((h: any) => h.fulfilled)

    const rawResponse = {
      data: {
        code: 0,
        message: "Success",
        meta: {
          page: 0,
          size: 12,
          totalElements: 9,
          totalPages: 1,
        },
        result: [{ id: 1, name: "Aqua City" }],
      },
    }

    const transformed = responseInterceptor.fulfilled(rawResponse)
    expect(transformed.result).toHaveLength(1)
    expect(transformed.meta.total).toBe(9)
    expect(transformed.meta.limit).toBe(12)
  })

  it("does not call onUnauthorized when auth login endpoint returns 401", async () => {
    const responseHandlers = (axios.interceptors.response as any).handlers
    const responseInterceptor = responseHandlers.find((h: any) => h.rejected)

    const error = {
      config: { url: "/api/auth/login/local" },
      response: {
        status: 401,
        data: { detail: "Sai tài khoản hoặc mật khẩu" },
      },
    }

    await expect(responseInterceptor.rejected(error)).rejects.toEqual(error)
  })
})
