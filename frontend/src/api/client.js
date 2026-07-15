const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export const apiGet = async (path, params) => {
  const url = new URL(`${apiBaseUrl}/${path.replace(/^\//, "")}`, window.location.origin);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {headers: {Accept: "application/json"}});
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }

  return data;
};
