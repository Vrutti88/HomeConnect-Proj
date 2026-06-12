import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DevicesPage from "./pages/DevicesPage";
import AutomationsPage from "./pages/AutomationsPage";
import AlertsPage from "./pages/AlertsPage";
import Sidebar from "./components/Sidebar";

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("dashboard");

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a" }}>
      <div style={{ color: "#38bdf8", fontSize: 18 }}>Loading HomeConnect…</div>
    </div>
  );

  if (!user) return <LoginPage />;

  const pages = { dashboard: <Dashboard />, devices: <DevicesPage />, automations: <AutomationsPage />, alerts: <AlertsPage /> };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {pages[page]}
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
