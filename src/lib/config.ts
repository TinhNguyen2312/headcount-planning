export const API_V1 = "/api"

type ApiConfig = {
  apiUrl: string
  onUnauthorized?: () => void
}

const config: ApiConfig = {
  apiUrl:
    (typeof window !== "undefined" &&
      ((window as any).RUNTIME_CONFIG?.NEXT_PUBLIC_API_URL ||
        (window as any).RUNTIME_CONFIG?.VITE_API_URL)) ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
    "",
}

export const getConfig = () => config

export const setOnUnauthorized = (fn: () => void) => {
  config.onUnauthorized = fn
}
