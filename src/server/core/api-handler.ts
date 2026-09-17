import { type NextRequest, NextResponse } from "next/server"
import type { z } from "zod"
import {
  type AuthenticatedUser,
  getOptionalUser,
  requireAuth,
  requireRoles,
} from "./auth"
import type { PaginationMeta } from "./pagination"
import type { PermissionKey } from "./permissions"
import {
  checkPermission,
  type ResolvedPermissions,
  resolveUserPermissions,
} from "./rbac"
import { apiSuccess, formatErrorResponse } from "./response"

export interface ApiContext<TQuery = unknown, TParams = unknown, TBody = unknown> {
  req: NextRequest
  user: AuthenticatedUser | null
  query: TQuery
  params: TParams
  body: TBody
  permissions?: ResolvedPermissions
}

export interface CustomApiResponse<T = unknown> {
  data?: T
  result?: T
  message?: string
  meta?: PaginationMeta | null
  status?: number
}

export interface ApiHandlerConfig<
  TQuery = unknown,
  TParams = unknown,
  TBody = unknown,
  TResult = unknown,
> {
  auth?: boolean
  roles?: string[]
  permissions?: (PermissionKey | string)[]
  getProjectId?: (ctx: {
    req: NextRequest
    user: AuthenticatedUser | null
    query: TQuery
    params: TParams
    body: TBody
  }) => number | undefined
  querySchema?: z.ZodType<TQuery>
  paramsSchema?: z.ZodType<TParams>
  bodySchema?: z.ZodType<TBody>
  successMessage?: string
  handler: (
    ctx: ApiContext<TQuery, TParams, TBody>,
  ) => Promise<TResult | CustomApiResponse<TResult> | NextResponse>
}

export function createApiHandler<
  TQuery = unknown,
  TParams = unknown,
  TBody = unknown,
  TResult = unknown,
>(config: ApiHandlerConfig<TQuery, TParams, TBody, TResult>) {
  return async (
    req: NextRequest,
    routeProps?: { params?: Promise<Record<string, unknown>> | Record<string, unknown> },
  ): Promise<NextResponse> => {
    try {
      // 1. Resolve Dynamic Route Params
      const rawParams = routeProps?.params
        ? ((await routeProps.params) as Record<string, unknown>)
        : {}

      const params = config.paramsSchema
        ? config.paramsSchema.parse(rawParams)
        : (rawParams as TParams)

      // 2. Parse and Validate Query Params
      const searchParams = new URL(req.url).searchParams
      const rawQuery: Record<string, unknown> = {}
      searchParams.forEach((value, key) => {
        rawQuery[key] = value
      })

      const query = config.querySchema
        ? config.querySchema.parse(rawQuery)
        : (rawQuery as TQuery)

      // 3. Parse and Validate Request Body (if schema is defined)
      let body: TBody = undefined as unknown as TBody
      if (config.bodySchema) {
        let rawBody: unknown = {}
        try {
          rawBody = await req.json()
        } catch {
          rawBody = {}
        }
        body = config.bodySchema.parse(rawBody)
      }

      // 4. Authenticate & System Roles Check
      const hasPermissions = Boolean(
        config.permissions && config.permissions.length > 0,
      )
      const mustAuth = Boolean(
        config.auth ||
          (config.roles && config.roles.length > 0) ||
          hasPermissions,
      )
      let user: AuthenticatedUser | null = null

      if (mustAuth) {
        user = await requireAuth(req)
        if (config.roles && config.roles.length > 0) {
          requireRoles(user, config.roles)
        }
      } else {
        user = await getOptionalUser(req)
      }

      // 5. Resolve and Enforce RBAC Permissions
      let resolvedPerms: ResolvedPermissions | undefined = undefined
      if (user) {
        let projectId: number | undefined = undefined
        if (config.getProjectId) {
          projectId = config.getProjectId({ req, user, query, params, body })
        } else if (params && typeof params === "object") {
          const p = params as Record<string, unknown>
          if (p.projectId) {
            projectId = Number(p.projectId)
          }
        }

        resolvedPerms = await resolveUserPermissions(
          user.id,
          projectId,
          user.systemRole,
        )

        if (config.permissions && config.permissions.length > 0) {
          for (const requiredPerm of config.permissions) {
            checkPermission(resolvedPerms, requiredPerm)
          }
        }
      }

      // 6. Execute Handler
      const responseData = await config.handler({
        req,
        user,
        query,
        params,
        body,
        permissions: resolvedPerms,
      })

      // 7. Return Response
      if (responseData instanceof NextResponse) {
        return responseData
      }

      if (
        responseData &&
        typeof responseData === "object" &&
        ("data" in responseData || "result" in responseData || "meta" in responseData)
      ) {
        const custom = responseData as CustomApiResponse<TResult>
        const content = custom.data !== undefined ? custom.data : custom.result
        return apiSuccess(
          content,
          custom.message || config.successMessage || "Thành công",
          custom.meta,
          custom.status || 200,
        )
      }

      return apiSuccess(
        responseData,
        config.successMessage || "Thành công",
      )
    } catch (error) {
      return formatErrorResponse(error)
    }
  }
}
