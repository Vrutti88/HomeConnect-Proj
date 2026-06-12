import { useState, useEffect } from "react";
import { api } from "../services/api";

const SEV_COLORS = {
  critical: { bg: "#450a0a", text: "#f87171", icon: "🚨" },
  warning:  { bg: "#431407", text: "#fb923c", icon: "⚠️" },
  info:     { bg: "#0c1a2e", text: "#60a5fa", icon: "ℹ️" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  const load = () => api.getAlerts().then(setAlerts);
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await api.markRead(id); load(); };
  const markAll = async () => { await api.markAllRead(); load(); };

  const unread = alerts.filter(a => !a.is_read).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700, margin: 0 }}>Alerts</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid #334155",
            background: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer"
          }}>Mark all read</button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.map(a => {
          const sev = SEV_COLORS[a.severity] || SEV_COLORS.info;
          return (
            <div key={a.id} style={{
              background: a.is_read ? "#1e293b" : sev.bg,
              border: `1px solid ${a.is_read ? "#334155" : sev.bg}`,
              borderRadius: 10, padding: "14px 18px",
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              opacity: a.is_read ? 0.6 : 1
            }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{sev.icon}</span>
                <div>
                  <div style={{ color: sev.text, fontSize: 13, fontWeight: 600 }}>{a.device_name}</div>
                  <div style={{ color: "#e2e8f0", fontSize: 13, marginTop: 2 }}>{a.message}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                    {a.type} · {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {!a.is_read && (
                <button onClick={() => markRead(a.id)} style={{
                  background: "none", border: "none", color: "#64748b", cursor: "pointer",
                  fontSize: 12, whiteSpace: "nowrap", marginLeft: 12
                }}>Mark read</button>
              )}
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div style={{ color: "#475569", textAlign: "center", marginTop: 60, fontSize: 14 }}>
            No alerts. Your home is running smoothly! ✅
          </div>
        )}
      </div>
    </div>
  );
}
