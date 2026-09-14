import {
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useMemo } from "react"
import { extractApiErrorMessage } from "@/lib/errors"
import type { ItemResponse, ListResponse, PaginationMeta } from "@/types"
import { useUI } from "../useUI"

type BaseEnvelope<TRaw = unknown> = {
  code?: number | string
  message?: string
  meta?: PaginationMeta
  raw?: TRaw
}

export type QueryOptionsHelper<TQueryFnData, TSelected = unknown> = Omit<
  UseQueryOptions<TQueryFnData, Error, TSelected, QueryKey>,
  "queryKey" | "queryFn"
>

export type SuspenseQueryOptionsHelper<
  TQueryFnData,
  TSelected = unknown,
> = Omit<
  UseSuspenseQueryOptions<TQueryFnData, Error, TSelected, QueryKey>,
  "queryKey" | "queryFn"
>

export type ListQueryResult<T, TSelected = T[]> = Omit<
  UseQueryResult<TSelected>,
  "data"
> &
  BaseEnvelope<ListResponse<T>> & {
    data: TSelected
    items: T[]
  }

export type SuspenseListQueryResult<T, TSelected = T[]> = Omit<
  UseSuspenseQueryResult<TSelected>,
  "data"
> &
  BaseEnvelope<ListResponse<T>> & {
    data: TSelected
    items: T[]
    raw: ListResponse<T>
  }

export type ItemQueryResult<T, TSelected = T> = Omit<
  UseQueryResult<TSelected>,
  "data"
> &
  BaseEnvelope<ItemResponse<T>> & {
    data: TSelected | undefined
  }

export type SuspenseItemQueryResult<T, TSelected = T> = Omit<
  UseSuspenseQueryResult<TSelected>,
  "data"
> &
  BaseEnvelope<ItemResponse<T>> & {
    data: TSelected
    raw: ItemResponse<T>
  }

const EMPTY_ARRAY: never[] = []

const unboxList = <T>(
  raw: unknown,
): {
  items: T[]
  meta?: PaginationMeta
  code?: number | string
  message?: string
} => {
  const r = raw as
    | (Record<string, unknown> & {
        result?: unknown
        data?: unknown
        meta?: PaginationMeta
        code?: number | string
        message?: string
      })
    | undefined
  let items: T[] = EMPTY_ARRAY as T[]
  if (Array.isArray(r?.result)) {
    items = r.result as T[]
  } else if (Array.isArray(r?.data)) {
    items = r.data as T[]
  } else if (Array.isArray(raw)) {
    items = raw as T[]
  }
  return {
    items,
    meta: r?.meta,
    code: r?.code,
    message: r?.message,
  }
}

const unboxItem = <T>(
  raw: unknown,
): {
  data: T | undefined
  meta?: PaginationMeta
  code?: number | string
  message?: string
} => {
  const r = raw as
    | (Record<string, unknown> & {
        result?: unknown
        meta?: PaginationMeta
        code?: number | string
        message?: string
      })
    | undefined
  const data =
    r && typeof r === "object" && "result" in r
      ? (r.result as T)
      : (raw as T | undefined)
  return {
    data,
    meta: r?.meta,
    code: r?.code,
    message: r?.message,
  }
}

export const useListQuery = <
  T,
  TSelected = T[],
  TQueryKey extends QueryKey = QueryKey,
>(
  queryOptionsObj: {
    queryKey: TQueryKey
    queryFn?: QueryFunction<ListResponse<T> | T[], TQueryKey>
  } & Record<string, unknown>,
  options?: QueryOptionsHelper<ListResponse<T>, TSelected>,
): ListQueryResult<T, TSelected> => {
  const query = useQuery({
    ...queryOptionsObj,
    ...options,
  } as UseQueryOptions<ListResponse<T>, Error, TSelected, QueryKey>)

  const { items, meta, code, message } = useMemo(
    () => unboxList<T>(query.data),
    [query.data],
  )
  const data = (options?.select ? query.data : items) as TSelected

  return Object.assign(query, {
    data,
    items,
    meta,
    code,
    message,
    raw: query.data as ListResponse<T> | undefined,
  }) as ListQueryResult<T, TSelected>
}

export const useSuspenseListQuery = <
  T,
  TSelected = T[],
  TQueryKey extends QueryKey = QueryKey,
>(
  queryOptionsObj: {
    queryKey: TQueryKey
    queryFn?: QueryFunction<ListResponse<T> | T[], TQueryKey>
  } & Record<string, unknown>,
  options?: SuspenseQueryOptionsHelper<ListResponse<T>, TSelected>,
): SuspenseListQueryResult<T, TSelected> => {
  const query = useSuspenseQuery({
    ...queryOptionsObj,
    ...options,
  } as UseSuspenseQueryOptions<ListResponse<T>, Error, TSelected, QueryKey>)

  const { items, meta, code, message } = useMemo(
    () => unboxList<T>(query.data),
    [query.data],
  )
  const data = (options?.select ? query.data : items) as TSelected

  return Object.assign(query, {
    data,
    items,
    meta,
    code,
    message,
    raw: query.data as ListResponse<T>,
  }) as SuspenseListQueryResult<T, TSelected>
}

export const useItemQuery = <
  T,
  TSelected = T,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryOptionsObj: {
    queryKey: TQueryKey
    queryFn?: QueryFunction<ItemResponse<T> | T | null, TQueryKey>
  } & Record<string, unknown>,
  options?: QueryOptionsHelper<ItemResponse<T>, TSelected>,
): ItemQueryResult<T, TSelected> => {
  const query = useQuery({
    ...queryOptionsObj,
    ...options,
  } as UseQueryOptions<ItemResponse<T>, Error, TSelected, QueryKey>)

  const {
    data: unboxed,
    meta,
    code,
    message,
  } = useMemo(() => unboxItem<T>(query.data), [query.data])
  const data = (options?.select ? query.data : unboxed) as TSelected | undefined

  return Object.assign(query, {
    data,
    meta,
    code,
    message,
    raw: query.data as ItemResponse<T> | undefined,
  }) as ItemQueryResult<T, TSelected>
}

export const useSuspenseItemQuery = <
  T,
  TSelected = T,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryOptionsObj: {
    queryKey: TQueryKey
    queryFn?: QueryFunction<ItemResponse<T> | T | null, TQueryKey>
  } & Record<string, unknown>,
  options?: SuspenseQueryOptionsHelper<ItemResponse<T>, TSelected>,
): SuspenseItemQueryResult<T, TSelected> => {
  const query = useSuspenseQuery({
    ...queryOptionsObj,
    ...options,
  } as UseSuspenseQueryOptions<ItemResponse<T>, Error, TSelected, QueryKey>)

  const {
    data: unboxed,
    meta,
    code,
    message,
  } = useMemo(() => unboxItem<T>(query.data), [query.data])
  const data = (options?.select ? query.data : unboxed) as TSelected

  return Object.assign(query, {
    data,
    meta,
    code,
    message,
    raw: query.data as ItemResponse<T>,
  }) as SuspenseItemQueryResult<T, TSelected>
}

export const useFetchList = <T, TParams = unknown>(
  key: QueryKey,
  fetcher: (params?: TParams) => Promise<ListResponse<T>>,
  params?: TParams,
  options?: Omit<UseQueryOptions<ListResponse<T>>, "queryKey" | "queryFn">,
) =>
  useListQuery<T>(
    { queryKey: [...key, params], queryFn: () => fetcher(params) },
    options as QueryOptionsHelper<ListResponse<T>, T[]>,
  )

export interface AllPagesConfig {
  /** Kích thước mỗi trang khi fetch từng đợt (chunk size). Mặc định: 50 */
  pageSize?: number
  /** Ngưỡng tối đa bản ghi để bảo vệ bộ nhớ trình duyệt (Circuit breaker). Mặc định: 1000 */
  maxLimit?: number
}

/**
 * Tự động vét toàn bộ các trang (Pagination Exhaustion) bằng cơ chế song song (Parallel execution)
 * kèm Circuit Breaker an toàn.
 */
export async function fetchAllPages<T, TParams = Record<string, unknown>>(
  fetcher: (
    params:
      | (TParams & { page: number; limit: number })
      | Record<string, unknown>,
  ) => Promise<ListResponse<T>>,
  baseParams?: TParams,
  config: AllPagesConfig = {},
): Promise<ListResponse<T>> {
  const pageSize = config.pageSize ?? 50
  const maxLimit = config.maxLimit ?? 1000

  // 1. Fetch trang đầu tiên (page: 0)
  const firstRes = await fetcher({
    ...(baseParams || {}),
    page: 0,
    limit: pageSize,
  })

  const { items: firstItems, meta, code, message } = unboxList<T>(firstRes)
  const totalPages = meta?.totalPages ?? 1
  const totalElements = meta?.totalElements ?? firstItems.length

  // Nếu chỉ có 1 trang hoặc rỗng hoặc đã đạt ngưỡng maxLimit
  if (
    totalPages <= 1 ||
    firstItems.length >= maxLimit ||
    firstItems.length >= totalElements
  ) {
    const sliced = firstItems.slice(0, maxLimit)
    return {
      code,
      message,
      result: sliced,
      meta: {
        page: 0,
        size: sliced.length,
        totalElements: Math.min(totalElements, maxLimit),
        totalPages: 1,
      },
    } as ListResponse<T>
  }

  // 2. Tính toán các trang cần fetch tiếp theo (tối đa tới maxLimit)
  const maxPages = Math.min(totalPages, Math.ceil(maxLimit / pageSize))
  const pagesToFetch: number[] = []
  for (let p = 1; p < maxPages; p++) {
    pagesToFetch.push(p)
  }

  // 3. Tải song song tất cả các trang còn lại (Parallel execution)
  const remainingResponses = await Promise.all(
    pagesToFetch.map((p) =>
      fetcher({
        ...(baseParams || {}),
        page: p,
        limit: pageSize,
      }),
    ),
  )

  // 4. Ghép toàn bộ dữ liệu lại
  let allItems = [...firstItems]
  for (const res of remainingResponses) {
    const { items } = unboxList<T>(res)
    allItems = allItems.concat(items)
    if (allItems.length >= maxLimit) {
      allItems = allItems.slice(0, maxLimit)
      break
    }
  }

  return {
    code,
    message,
    result: allItems,
    meta: {
      page: 0,
      size: allItems.length,
      totalElements: allItems.length,
      totalPages: 1,
    },
  } as ListResponse<T>
}

export const useFetchOne = <T, TParams = unknown>(
  key: QueryKey,
  fetcher: (id: number, params?: TParams) => Promise<ItemResponse<T>>,
  id?: number,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
  params?: TParams,
) =>
  useItemQuery<T>(
    {
      queryKey: [...key, id, params],
      queryFn: () => {
        if (!id) throw new Error("ID is required")
        return fetcher(id, params)
      },
    },
    {
      enabled: !!id && options?.enabled !== false,
      ...(options as QueryOptionsHelper<ItemResponse<T>, T>),
    },
  )

export const useCreateItem = <TIn, TOut = unknown>(
  key: QueryKey,
  fetcher: (data: TIn) => Promise<ItemResponse<TOut>>,
  successMsg = "Tạo thành công!",
  errorMsg = "Tạo thất bại!",
  relatedKeys?: QueryKey[],
) => {
  const { message } = useUI()
  const queryClient = useQueryClient()

  return useMutation<ItemResponse<TOut>, unknown, TIn>({
    mutationFn: (data) => fetcher(data),
    onSuccess: () => {
      message.success(successMsg)
      queryClient.invalidateQueries({ queryKey: key, exact: false })
      relatedKeys?.forEach((rKey) => {
        queryClient.invalidateQueries({ queryKey: rKey, exact: false })
      })
    },
    onError: (error) => {
      message.error(extractApiErrorMessage(error, errorMsg))
    },
  })
}

export const useUpdateItem = <TIn, TOut = unknown>(
  key: QueryKey,
  fetcher: (id: number, data: TIn) => Promise<ItemResponse<TOut>>,
  successMsg = "Cập nhật thành công!",
  errorMsg = "Cập nhật thất bại!",
  relatedKeys?: QueryKey[],
) => {
  const { message } = useUI()
  const queryClient = useQueryClient()

  return useMutation<ItemResponse<TOut>, unknown, { id: number; data: TIn }>({
    mutationFn: ({ id, data }) => fetcher(id, data),
    onSuccess: () => {
      message.success(successMsg)
      queryClient.invalidateQueries({ queryKey: key, exact: false })
      relatedKeys?.forEach((rKey) => {
        queryClient.invalidateQueries({ queryKey: rKey, exact: false })
      })
    },
    onError: (error) => {
      message.error(extractApiErrorMessage(error, errorMsg))
    },
  })
}

export const useDeleteItem = <TOut = void>(
  key: QueryKey,
  fetcher: (id: number) => Promise<ItemResponse<TOut> | ItemResponse<void>>,
  successMsg = "Xóa thành công!",
  errorMsg = "Xóa thất bại!",
  relatedKeys?: QueryKey[],
) => {
  const { message } = useUI()
  const queryClient = useQueryClient()

  return useMutation<ItemResponse<TOut> | ItemResponse<void>, unknown, number>({
    mutationFn: (id) => fetcher(id),
    onSuccess: () => {
      message.success(successMsg)
      queryClient.invalidateQueries({ queryKey: key, exact: false })
      relatedKeys?.forEach((rKey) => {
        queryClient.invalidateQueries({ queryKey: rKey, exact: false })
      })
    },
    onError: (error) => {
      message.error(extractApiErrorMessage(error, errorMsg))
    },
  })
}
