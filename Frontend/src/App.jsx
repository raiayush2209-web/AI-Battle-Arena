import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ConversationProvider } from "./context/ConversationContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BattleArena from "./components/BattleArena";
import ProtectedRoute from "./components/ProtectedRoute";

function MainContent() {
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  return (
    <ProtectedRoute
      fallback={
        authMode === "login" ? (
          <Login onSwitchToRegister={() => setAuthMode("register")} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode("login")} />
        )
      }
    >
      <ConversationProvider>
        <BattleArena />
      </ConversationProvider>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
