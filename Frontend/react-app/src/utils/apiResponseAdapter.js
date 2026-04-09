import axios from "axios";

function isApiResponseEnvelope(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    typeof payload.success === "boolean" &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  );
}

function normalizeApiResponse(payload) {
  if (!isApiResponseEnvelope(payload)) {
    return payload;
  }

  const { success, message, timestamp, errorCode, data } = payload;

  // Preserve array semantics while exposing envelope metadata.
  if (Array.isArray(data)) {
    const normalized = [...data];
    normalized.success = success;
    normalized.message = message;
    normalized.timestamp = timestamp;
    normalized.errorCode = errorCode;
    normalized.data = data;
    return normalized;
  }

  // Flatten object payloads for legacy consumers that expect response.data.<field>.
  if (data && typeof data === "object") {
    return {
      ...data,
      success,
      message,
      timestamp,
      errorCode,
      data,
    };
  }

  // Primitive payloads remain accessible via data/value while keeping metadata.
  return {
    success,
    message,
    timestamp,
    errorCode,
    data,
    value: data,
  };
}

function installApiResponseAdapter() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.__apiResponseAdapterInstalled) {
    return;
  }

  axios.interceptors.response.use(
    (response) => {
      response.data = normalizeApiResponse(response.data);
      return response;
    },
    (error) => {
      if (error?.response?.data) {
        error.response.data = normalizeApiResponse(error.response.data);
      }
      return Promise.reject(error);
    }
  );

  window.__apiResponseAdapterInstalled = true;
}

installApiResponseAdapter();
