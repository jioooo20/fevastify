const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type RequestOptions = RequestInit & {
  headers?: HeadersInit
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')

  const data = isJson ? ((await response.json()) as JsonValue) : await response.text()

  if (!response.ok) {
    const message =
      typeof data === 'string' && data
        ? data
        : data && typeof data === 'object' && 'message' in data
          ? String(data.message)
          : `${response.status} ${response.statusText}`
    throw new Error(message)
  }

  return data as T
}

export { API_URL }
