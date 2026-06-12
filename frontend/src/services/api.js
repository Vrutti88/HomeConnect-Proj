const BASE = "http://localhost:5001/api/v1";

function headers() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // auth
  login: (email, password) => request("POST", "/auth/login", { email, password }),
  register: (name, email, password) => request("POST", "/auth/register", { name, email, password }),
  me: () => request("GET", "/auth/me"),

  // devices
  getDevices: () => request("GET", "/devices"),
  addDevice: (d) => request("POST", "/devices", d),
  updateDevice: (id, d) => request("PUT", `/devices/${id}`, d),
  deleteDevice: (id) => request("DELETE", `/devices/${id}`),
  controlDevice: (id, cmd) => request("POST", `/devices/${id}/control`, cmd),

  // automations
  getAutomations: () => request("GET", "/automations"),
  addAutomation: (r) => request("POST", "/automations", r),
  updateAutomation: (id, r) => request("PUT", `/automations/${id}`, r),
  deleteAutomation: (id) => request("DELETE", `/automations/${id}`),

  // telemetry
  getTelemetry: (deviceId, hours = 24) => request("GET", `/telemetry/${deviceId}?hours=${hours}`),
  sendTelemetry: (t) => request("POST", "/telemetry", t),

  // alerts
  getAlerts: () => request("GET", "/alerts"),
  markRead: (id) => request("PUT", `/alerts/${id}/read`),
  markAllRead: () => request("PUT", "/alerts/read-all"),

  // analytics
  getDashboard: () => request("GET", "/analytics/dashboard"),
};
