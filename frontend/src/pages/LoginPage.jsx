import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "demo@homeconnect.com", password: "demo123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = "text") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: "1px solid #334155", background: "#1e293b",
          color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none"
        }} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: 40, width: 380,
        border: "1px solid #334155", boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40 }}>🏠</div>
          <h1 style={{ color: "#38bdf8", fontSize: 24, fontWeight: 700, margin: "8px 0 4px" }}>HomeConnect</h1>
          <p style={{ color: "#64748b", fontSize: 13 }}>Smart Home Automation Platform</p>
        </div>

        <form onSubmit={handle}>
          {mode === "register" && field("Full Name", "name")}
          {field("Email", "email", "email")}
          {field("Password", "password", "password")}

          {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: "#0ea5e9", color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 20 }}>
          {mode === "login" ? "No account?" : "Have an account?"}{" "}
          <span onClick={() => setMode(mode === "login" ? "register" : "login")}
            style={{ color: "#38bdf8", cursor: "pointer" }}>
            {mode === "login" ? "Register" : "Login"}
          </span>
        </p>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 11, marginTop: 12 }}>
          Demo: demo@homeconnect.com / demo123
        </p>
      </div>
    </div>
  );
}
