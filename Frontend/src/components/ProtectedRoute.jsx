import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, fallback }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 rounded-full animate-spin border-t-purple-500"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-b-cyan-500"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm font-medium">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return fallback || null;
  }

  return children;
}
