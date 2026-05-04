const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

let refreshPromise = null;

const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

const redirectToLogin = () => {
  clearSession();

  if (window.location.pathname !== "/") {
    window.location.assign("/");
  }
};

const buildHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

const parseResponse = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(parseResponse)
      .then((data) => {
        if (!data?.success || !data?.data?.access_token) {
          return null;
        }

        localStorage.setItem("access_token", data.data.access_token);
        return data.data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const request = async (token) => fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: buildHeaders(token),
    ...(body !== null && { body: JSON.stringify(body) }),
  });

  try {
    let res = await request(getAccessToken());

    if (res.status === 401 && endpoint !== "/login" && endpoint !== "/signup") {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        redirectToLogin();
        return { success: false, message: "Session expired. Please login again." };
      }

      res = await request(newToken);
    }

    const data = await parseResponse(res);

    if (res.status === 429) {
      return { success: false, message: data.message || "Too many requests. Slow down." };
    }

    if (!res.ok) {
      return {
        success: false,
        message:
          data.message ||
          data.detail?.message ||
          data.detail ||
          "Something went wrong",
      };
    }

    return data;
  } catch (error) {
    console.error("API error:", error);
    return {
      success: false,
      message: "Server not reachable. Check that the backend is running.",
    };
  }
};
