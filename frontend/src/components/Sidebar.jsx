import { useAuth } from "../AuthContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "devices", label: "Devices", icon: "⚡" },
  { id: "automations", label: "Automations", icon: "⚙" },
  { id: "alerts", label: "Alerts", icon: "🔔" },
];

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: 220, background: "#1e293b", display: "flex", flexDirection: "column",
      padding: "24px 0", borderRight: "1px solid #334155"
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #334155" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#38bdf8", letterSpacing: -0.5 }}>🏠 HomeConnect</div>
        <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Smart Home Platform</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: page === item.id ? "#0ea5e9" : "transparent",
            color: page === item.id ? "#fff" : "#94a3b8",
            fontSize: 14, fontWeight: page === item.id ? 600 : 400,
            marginBottom: 4, transition: "all 0.15s",
          }}>
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #334155" }}>
        <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
        <div style={{ color: "#64748b", fontSize: 11, marginBottom: 10 }}>{user?.email}</div>
        <button onClick={logout} style={{
          width: "100%", padding: "6px", borderRadius: 6, border: "1px solid #334155",
          background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer"
        }}>Sign Out</button>
      </div>
    </aside>
  );
}
