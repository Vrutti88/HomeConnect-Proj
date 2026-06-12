import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function AutomationsPage() {
  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "", trigger_type: "time", trigger_value: "07:00",
    action_device_id: "", action_command: '{"power":"on"}'
  });

  const load = () => Promise.all([api.getAutomations(), api.getDevices()]).then(([r, d]) => { setRules(r); setDevices(d); });
  useEffect(() => { load(); }, []);

  const toggle = async (rule) => {
    await api.updateAutomation(rule.id, { is_enabled: !rule.is_enabled });
    load();
  };

  const del = async (id) => {
    if (!confirm("Delete this rule?")) return;
    await api.deleteAutomation(id);
    load();
  };

  const add = async () => {
    try {
      await api.addAutomation({
        ...form,
        action_device_id: parseInt(form.action_device_id),
        action_command: JSON.parse(form.action_command)
      });
      setShowAdd(false);
      load();
    } catch (e) { alert(e.message); }
  };

  const inputStyle = {
    padding: "8px 12px", borderRadius: 6, border: "1px solid #334155",
    background: "#0f172a", color: "#e2e8f0", fontSize: 13, width: "100%", boxSizing: "border-box"
  };

  const TRIGGER_HINTS = {
    time: "HH:MM (24h) e.g. 07:00",
    threshold: "metric>value e.g. temperature>28",
    device_state: "device_id:key=value"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700, margin: 0 }}>Automation Rules</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Define rules that run automatically based on time or sensor data.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: "8px 18px", borderRadius: 8, border: "none", background: "#a78bfa",
          color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer"
        }}>+ New Rule</button>
      </div>

      {showAdd && (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 24, border: "1px solid #334155", marginBottom: 24 }}>
          <h4 style={{ color: "#e2e8f0", marginTop: 0, marginBottom: 16 }}>New Automation Rule</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>Rule Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Morning Routine" />
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>Trigger Type</label>
              <select value={form.trigger_type} onChange={e => setForm({ ...form, trigger_type: e.target.value })} style={inputStyle}>
                <option value="time">Time-based</option>
                <option value="threshold">Sensor Threshold</option>
              </select>
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>
                Trigger Value <span style={{ color: "#475569" }}>({TRIGGER_HINTS[form.trigger_type]})</span>
              </label>
              <input value={form.trigger_value} onChange={e => setForm({ ...form, trigger_value: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>Target Device</label>
              <select value={form.action_device_id} onChange={e => setForm({ ...form, action_device_id: e.target.value })} style={inputStyle}>
                <option value="">Select device…</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ color: "#64748b", fontSize: 12, display: "block", marginBottom: 4 }}>Action Command (JSON)</label>
              <input value={form.action_command} onChange={e => setForm({ ...form, action_command: e.target.value })} style={inputStyle}
                placeholder='{"power":"on","brightness":80}' />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={add} style={{
              padding: "8px 20px", borderRadius: 6, border: "none", background: "#a78bfa",
              color: "#fff", fontSize: 13, cursor: "pointer"
            }}>Save Rule</button>
            <button onClick={() => setShowAdd(false)} style={{
              padding: "8px 20px", borderRadius: 6, border: "1px solid #334155",
              background: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer"
            }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rules.map(r => (
          <div key={r.id} style={{
            background: "#1e293b", borderRadius: 10, padding: "16px 20px",
            border: `1px solid ${r.is_enabled ? "#2e1065" : "#334155"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>{r.trigger_type === "time" ? "⏰" : "📊"}</span>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                  When <b style={{ color: "#a78bfa" }}>{r.trigger_type}</b> = "{r.trigger_value}" →&nbsp;
                  <b style={{ color: "#38bdf8" }}>{r.action_device_name}</b>: {JSON.stringify(r.action_command)}
                </div>
                {r.last_triggered && (
                  <div style={{ color: "#475569", fontSize: 11 }}>Last triggered: {new Date(r.last_triggered).toLocaleString()}</div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => toggle(r)} style={{
                padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
                background: r.is_enabled ? "#14532d" : "#334155",
                color: r.is_enabled ? "#4ade80" : "#94a3b8"
              }}>{r.is_enabled ? "Enabled" : "Disabled"}</button>
              <button onClick={() => del(r.id)} style={{
                background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16
              }}>✕</button>
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <div style={{ color: "#475569", textAlign: "center", marginTop: 60, fontSize: 14 }}>
            No automation rules yet. Create one to automate your home.
          </div>
        )}
      </div>
    </div>
  );
}
