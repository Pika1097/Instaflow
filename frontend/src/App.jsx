import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Analytics from "./pages/Analytics";
import Campaigns from "./pages/Campaigns";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function AppShell({ children, darkMode, setDarkMode }) {
  return (
    <ProtectedRoute>
      <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
        {children}
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/signup" element={<Signup darkMode={darkMode} setDarkMode={setDarkMode} />} />

        <Route
          path="/dashboard"
          element={(
            <AppShell darkMode={darkMode} setDarkMode={setDarkMode}>
              <Dashboard />
            </AppShell>
          )}
        />
        <Route
          path="/campaigns"
          element={(
            <AppShell darkMode={darkMode} setDarkMode={setDarkMode}>
              <Campaigns />
            </AppShell>
          )}
        />
        <Route
          path="/analytics"
          element={(
            <AppShell darkMode={darkMode} setDarkMode={setDarkMode}>
              <Analytics />
            </AppShell>
          )}
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
