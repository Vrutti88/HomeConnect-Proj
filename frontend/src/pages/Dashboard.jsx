import { useState, useEffect } from "react";
import { api } from "../services/api";

const DEVICE_ICONS = { light: "💡", thermostat: "🌡️", camera: "📹", lock: "🔒", sensor: "📡" };

function StatCard({ label, value, sub, color = "#38bdf8" }) {
  return (
    <div style={{
      background: "#1e293b", borderRadius: 12, padding: "20px 24px",
      border: "1px solid #334155", flex: 1, minWidth: 160
    }}>
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ color, fontSize: 36, fontWeight: 700, margin: "8px 0 4px" }}>{value}</div>
      {sub && <div style={{ color: "#475569", fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getDevices(), api.getAlerts()])
      .then(([s, d, a]) => { setStats(s); setDevices(d); setAlerts(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#64748b" }}>Loading dashboard…</div>;

  return (
    <div>
      <h2 style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Dashboard</h2>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard label="Total Devices" value={stats.total_devices} sub={`${stats.online_devices} online`} />
        <StatCard label="Online" value={stats.online_devices} color="#4ade80" sub="active now" />
        <StatCard label="Automations" value={stats.total_automations} color="#a78bfa" sub="rules enabled" />
        <StatCard label="Unread Alerts" value={stats.unread_alerts} color="#f87171" sub="need attention" />
        <StatCard label="Telemetry (24h)" value={stats.telemetry_events_24h} color="#fb923c" sub="events logged" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Devices by type */}
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155" }}>
          <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Devices by Type</h3>
          {stats.devices_by_type.map(({ type, count }) => (
            <div key={type} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>{DEVICE_ICONS[type] || "📦"} {type}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 80, height: 6, background: "#334155", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(count / stats.total_devices) * 100}%`, height: "100%", background: "#0ea5e9", borderRadius: 3 }} />
                </div>
                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, width: 16 }}>{count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Alerts */}
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155" }}>
          <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent Alerts</h3>
          {alerts.slice(0, 4).map(a => (
            <div key={a.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12,
              padding: "10px", borderRadius: 8,
              background: a.is_read ? "transparent" : "#0f172a",
              border: "1px solid #334155"
            }}>
              <span style={{ fontSize: 16 }}>
                {a.severity === "critical" ? "🚨" : a.severity === "warning" ? "⚠️" : "ℹ️"}
              </span>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 12 }}>{a.message}</div>
                <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <div style={{ color: "#475569", fontSize: 13 }}>No alerts</div>}
        </div>
      </div>

      {/* All devices quick view */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155", marginTop: 24 }}>
        <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Device Status Overview</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {devices.map(d => (
            <div key={d.id} style={{
              background: "#0f172a", borderRadius: 8, padding: "12px 16px",
              border: `1px solid ${d.status === "online" ? "#166534" : "#7f1d1d"}`, minWidth: 160
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{DEVICE_ICONS[d.type] || "📦"}</div>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{d.name}</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>{d.location}</div>
              <div style={{
                display: "inline-block", marginTop: 6, padding: "2px 8px", borderRadius: 20,
                background: d.status === "online" ? "#14532d" : "#450a0a",
                color: d.status === "online" ? "#4ade80" : "#f87171", fontSize: 11
              }}>{d.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
