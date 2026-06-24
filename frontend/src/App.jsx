import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Bot from "./components/bot/Bot";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

// ─── Protected Route ───
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();
  if (!authUser) return <Navigate to="/login" replace />;
  return children;
};

// ─── Public Route (redirect to chat if already logged in) ───
const PublicRoute = ({ children }) => {
  const { authUser } = useAuth();
  if (authUser) return <Navigate to="/chat" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Default → redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected route */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Bot />
          </ProtectedRoute>
        }
      />

      {/* 404 → redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}