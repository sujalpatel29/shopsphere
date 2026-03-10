function collectMessages(value) {
  if (!value) return [];

  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectMessages(item));
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) => collectMessages(item));
  }

  return [];
}

function getStatusFallback(status) {
  switch (status) {
    case 400:
      return "The request was invalid. Please check the submitted data.";
    case 401:
      return "Your session has expired or authentication failed. Please log in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This action conflicts with existing data.";
    case 422:
      return "Some fields are invalid. Please review the form and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      return status >= 500
        ? "Something went wrong on the server. Please try again."
        : null;
  }
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  const response = error.response;
  const data = response?.data;

  const directMessage =
    data?.message ||
    data?.error ||
    data?.details?.message ||
    data?.data?.message;

  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage.trim();
  }

  const collected = [
    ...collectMessages(data?.errors),
    ...collectMessages(data?.details?.errors),
    ...collectMessages(data?.data?.errors),
  ].filter(Boolean);

  if (collected.length > 0) {
    return collected.join(" ");
  }

  if (!response) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return "You appear to be offline. Please check your internet connection.";
    }

    if (error.message === "Network Error") {
      return "Unable to reach the server. Please check your connection and backend URL.";
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }

    return fallback;
  }

  return getStatusFallback(response.status) || fallback;
}

export default getApiErrorMessage;
