import { AxiosError, type AxiosResponse } from "axios"
import { describe, expect, it, vi } from "vitest"
import {
  applyApiFieldErrors,
  extractApiErrorMessage,
  extractApiFieldErrors,
} from "@/lib/errors"

describe("extractApiErrorMessage", () => {
  it("returns fallback for null or undefined errors", () => {
    expect(extractApiErrorMessage(null)).toBe("Có lỗi xảy ra.")
    expect(extractApiErrorMessage(undefined, "Lỗi mặc định")).toBe(
      "Lỗi mặc định",
    )
  })

  it("extracts 409 Conflict detail message string from Axios error", () => {
    const error = new AxiosError(
      "Request failed with status code 409",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 409,
        data: { detail: "Tên dự án đã tồn tại trong hệ thống" },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe(
      "Tên dự án đã tồn tại trong hệ thống",
    )
  })

  it("extracts first validation error from 422 array detail", () => {
    const error = new AxiosError(
      "Request failed with status code 422",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 422,
        data: {
          detail: [
            {
              loc: ["body", "name"],
              msg: "Tên dự án không được để trống",
              type: "value_error",
            },
          ],
        },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe("Tên dự án không được để trống")
  })

  it("extracts message property from body if detail is absent", () => {
    const error = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: { message: "Không thể thực hiện thao tác" },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe("Không thể thực hiện thao tác")
  })

  it("extracts message from standard Error instance", () => {
    const error = new Error("Network timeout")
    expect(extractApiErrorMessage(error)).toBe("Network timeout")
  })

  it("returns string error directly", () => {
    expect(extractApiErrorMessage("Lỗi kết nối máy chủ")).toBe(
      "Lỗi kết nối máy chủ",
    )
  })

  it("extracts result field error when code is 1001 instead of showing generic message", () => {
    const error = new AxiosError(
      "Request failed with status code 400",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: {
          code: 1001,
          message: "Validation failed",
          result: {
            password: "Password must be at least 8 characters",
          },
        },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe(
      "Password must be at least 8 characters",
    )
  })

  it("extracts multiple field errors from result when code is 1001", () => {
    const error = new AxiosError(
      "Request failed with status code 400",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: {
          code: "1001",
          message: "Validation failed",
          result: {
            username: "Tên đăng nhập không hợp lệ",
            password: "Mật khẩu không đủ mạnh",
          },
        },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe(
      "Tên đăng nhập không hợp lệ, Mật khẩu không đủ mạnh",
    )
  })

  it("extracts array of errors in result field when code is 1001", () => {
    const error = new AxiosError(
      "Request failed with status code 400",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: {
          code: 1001,
          message: "Validation failed",
          result: {
            roles: ["Vai trò không hợp lệ", "Vai trò đã tồn tại"],
          },
        },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe(
      "Vai trò không hợp lệ, Vai trò đã tồn tại",
    )
  })

  it("falls back to message when code is 1001 but result is empty or null", () => {
    const error = new AxiosError(
      "Request failed with status code 400",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: {
          code: 1001,
          message: "Validation failed",
          result: {},
        },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe("Validation failed")
  })

  it("extracts error from plain string response data", () => {
    const error = new AxiosError(
      "Request failed with status code 401",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 401,
        data: "Tài khoản hoặc mật khẩu không chính xác",
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe(
      "Tài khoản hoặc mật khẩu không chính xác",
    )
  })

  it("extracts error from body.error property", () => {
    const error = new AxiosError(
      "Request failed with status code 401",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 401,
        data: {
          error: "Tài khoản của bạn đã bị khóa",
        },
      } as AxiosResponse,
    )

    expect(extractApiErrorMessage(error)).toBe("Tài khoản của bạn đã bị khóa")
  })
})

describe("extractApiFieldErrors & applyApiFieldErrors", () => {
  it("extracts field errors map from code 1001 validation result object", () => {
    const error = new AxiosError(
      "Request failed with status code 400",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: {
          code: 1001,
          message: "Validation failed",
          result: {
            projectRole: "Vai trò dự án không được để trống",
            effectiveFrom: "Ngày hiệu lực không được để trống",
            userId: "ID nhân sự không được để trống",
            projectId: "ID dự án không được để trống",
          },
        },
      } as AxiosResponse,
    )

    const fieldErrors = extractApiFieldErrors(error)
    expect(fieldErrors).toEqual({
      projectRole: ["Vai trò dự án không được để trống"],
      effectiveFrom: ["Ngày hiệu lực không được để trống"],
      userId: ["ID nhân sự không được để trống"],
      projectId: ["ID dự án không được để trống"],
    })
  })

  it("applies extracted field errors onto an antd form instance", () => {
    const error = new AxiosError(
      "Request failed with status code 400",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        data: {
          code: 1001,
          message: "Validation failed",
          result: {
            email: "Email đã tồn tại",
          },
        },
      } as AxiosResponse,
    )

    const mockForm = {
      setFields: vi.fn(),
    }

    const applied = applyApiFieldErrors(mockForm as any, error)
    expect(applied).toBe(true)
    expect(mockForm.setFields).toHaveBeenCalledWith([
      { name: "email", errors: ["Email đã tồn tại"] },
    ])
  })
})
