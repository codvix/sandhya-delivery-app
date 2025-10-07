export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown): { message: string; status: number } {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status }
  }

  if (error instanceof Error) {
    console.error("API Error:", error)
    return { message: "An unexpected error occurred", status: 500 }
  }

  return { message: "An unknown error occurred", status: 500 }
}

export function createApiResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export function createApiErrorResponse(message: string, status: number = 500) {
  return createApiResponse({ error: message }, status)
}
