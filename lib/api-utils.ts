/**
 * Handle API errors with consistent formatting
 */
export function handleApiError(error: any, defaultMessage = "API Error") {
  console.error("API Error:", error)

  // Extract the error message
  let errorMessage = defaultMessage
  const useFallback = true

  if (error instanceof Error) {
    // Check if it's a JSON parsing error
    if (error.message.includes("JSON")) {
      errorMessage = `Invalid API response: ${error.message}`
    } else if (error.message.includes("timeout")) {
      errorMessage = "API request timed out. Please try again."
    } else if (error.message.includes("network")) {
      errorMessage = "Network error. Please check your connection and try again."
    } else {
      errorMessage = error.message
    }
  } else if (typeof error === "string") {
    errorMessage = error
  }

  return { error: errorMessage, useFallback }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse(text: string) {
  try {
    return { data: JSON.parse(text), error: null }
  } catch (error) {
    console.error("JSON parsing error:", error)
    return {
      data: null,
      error: `Invalid JSON response: ${error instanceof Error ? error.message : String(error)}. Response starts with: ${text.substring(0, 50)}...`,
    }
  }
}

/**
 * Add timeout to fetch requests
 */
export function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout),
    ),
  ]) as Promise<Response>
}
