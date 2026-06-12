import { useState, useEffect } from "react";
import { api } from "../services/api";

const DEVICE_ICONS = { light: "💡", thermostat: "🌡️", camera: "📹", lock: "🔒", sensor: "📡" };
const DEVICE_TYPES = ["light", "thermostat", "camera", "lock", "sensor"];

function DeviceCard({ device, onControl, onDelete }) {
  const state = device.state || {};
  const isOn = state.power === "on" || state.recording || state.locked;

  return (
    <div style={{
      background: "#1e293b", borderRadius: 12, padding: 20,
      border: `1px solid ${device.status === "online" ? "#1e3a5f" : "#3f1010"}`,
      position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: 28 }}>{DEVICE_ICONS[device.type] || "📦"}</span>
          <h4 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600, margin: "6px 0 2px" }}>{device.name}</h4>
          <div style={{ color: "#64748b", fontSize: 12 }}>{device.location} · {device.type}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{
            padding: "2px 10px", borderRadius: 20, fontSize: 11,
            background: device.status === "online" ? "#14532d" : "#450a0a",
            color: device.status === "online" ? "#4ade80" : "#f87171"
          }}>{device.status}</span>
          <button onClick={() => onDelete(device.id)} style={{
            background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14
          }}>✕</button>
        </div>
      </div>

      {/* State display */}
      <div style={{ marginTop: 12, padding: "8px 12px", background: "#0f172a", borderRadius: 8, fontSize: 12, color: "#94a3b8" }}>
        {Object.entries(state).map(([k, v]) => (
          <span key={k} style={{ marginRight: 10 }}><b style={{ color: "#64748b" }}>{k}:</b> {String(v)}</span>
        ))}
      </div>

      {/* Controls */}
      {device.status === "online" && device.type === "light" && (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={() => onControl(device.id, { power: state.power === "on" ? "off" : "on" })}
            style={{
              flex: 1, padding: "8px", borderRadius: 6, border: "none", cursor: "pointer",
              background: state.power === "on" ? "#854d0e" : "#166534",
              color: state.power === "on" ? "#fbbf24" : "#4ade80", fontSize: 13, fontWeight: 600
            }}>
            {state.power === "on" ? "Turn Off" : "Turn On"}
          </button>
          {state.power === "on" && (
            <input type="range" min="10" max="100" value={state.brightness || 50}
              onChange={e => onControl(device.id, { brightness: parseInt(e.target.value) })}
              style={{ flex: 1 }} />
          )}
        </div>
      )}
      {device.status === "online" && device.type === "lock" && (
        <button onClick={() => onControl(device.id, { locked: !state.locked })}
          style={{
            marginTop: 12, width: "100%", padding: "8px", borderRadius: 6, border: "none", cursor: "pointer",
            background: state.locked ? "#1e3a5f" : "#450a0a",
            color: state.locked ? "#60a5fa" : "#f87171", fontSize: 13, fontWeight: 600
          }}>
          {state.locked ? "🔒 Unlock" : "🔓 Lock"}
        </button>
      )}
    </div>
  );
}

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "light", location: "" });
  const [loading, setLoading] = useState(true);

  const load = () => api.getDevices().then(setDevices).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addDevice = async () => {
    await api.addDevice({ ...form, state: {} });
    setShowAdd(false);
    setForm({ name: "", type: "light", location: "" });
    load();
  };

  const control = async (id, cmd) => {
    await api.controlDevice(id, cmd);
    load();
  };

  const del = async (id) => {
    if (!confirm("Remove this device?")) return;
    await api.deleteDevice(id);
    load();
  };

  if (loading) return <div style={{ color: "#64748b" }}>Loading devices…</div>;

  const inputStyle = {
    padding: "8px 12px", borderRadius: 6, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 13, width: "100%", boxSizing: "border-box"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700 }}>Devices</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: "8px 18px", borderRadius: 8, border: "none", background: "#0ea5e9",
          color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer"
        }}>+ Add Device</button>
      </div>

      {showAdd && (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155", marginBottom: 24 }}>
          <h4 style={{ color: "#e2e8f0", marginBottom: 16 }}>New Device</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Kitchen Light" />
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                {DEVICE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} placeholder="Kitchen" />
            </div>
            <button onClick={addDevice} style={{
              padding: "8px 16px", borderRadius: 6, border: "none", background: "#0ea5e9",
              color: "#fff", fontSize: 13, cursor: "pointer"
            }}>Add</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {devices.map(d => <DeviceCard key={d.id} device={d} onControl={control} onDelete={del} />)}
      </div>
      {devices.length === 0 && (
        <div style={{ color: "#475569", textAlign: "center", marginTop: 60, fontSize: 14 }}>
          No devices yet. Add one to get started.
        </div>
      )}
    </div>
  );
}
