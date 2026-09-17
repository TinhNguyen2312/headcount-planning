import type { ZodError } from "zod"

export class AppError extends Error {
  public readonly statusCode: number
  public readonly errorCode: string
  public readonly detail?: unknown

  constructor(
    message: string,
    statusCode: number = 400,
    errorCode: string = "BAD_REQUEST",
    detail?: unknown,
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.detail = detail
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Dữ liệu yêu cầu không hợp lệ", detail?: unknown) {
    super(message, 400, "BAD_REQUEST", detail)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Chưa đăng nhập hoặc phiên làm việc đã hết hạn") {
    super(message, 401, "UNAUTHORIZED")
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Bạn không có quyền thực hiện hành động này") {
    super(message, 403, "FORBIDDEN")
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Không tìm thấy tài nguyên yêu cầu") {
    super(message, 404, "NOT_FOUND")
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Dữ liệu đã tồn tại hoặc xảy ra xung đột") {
    super(message, 409, "CONFLICT")
  }
}

export interface FormattedValidationError {
  field: string
  message: string
}

export class ValidationError extends AppError {
  public readonly errors: FormattedValidationError[]

  constructor(
    message: string = "Dữ liệu gửi lên không đúng định dạng",
    zodError?: ZodError,
  ) {
    const formattedErrors: FormattedValidationError[] = zodError
      ? zodError.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      : []

    super(message, 422, "VALIDATION_ERROR", formattedErrors)
    this.errors = formattedErrors
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string = "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau",
    detail?: unknown,
  ) {
    super(message, 500, "INTERNAL_SERVER_ERROR", detail)
  }
}
