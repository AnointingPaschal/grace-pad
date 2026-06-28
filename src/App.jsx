import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotesProvider } from "./contexts/NotesContext";
import { BibleProvider } from "./contexts/BibleContext";
import MobileLayout from "./components/layout/MobileLayout";
import Login from "./components/auth/Login";
import LoadingScreen from "./components/ui/LoadingScreen";
import BiblePage from "./pages/BiblePage";
import NotesPage from "./pages/NotesPage";

function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Login />;
  return (
    <NotesProvider>
      <BibleProvider>
        <MobileLayout>
          <Routes>
            <Route path="/"          element={<BiblePage />} />
            <Route path="/bible"     element={<BiblePage />} />
            <Route path="/notes"     element={<NotesPage />} />
            <Route path="/notes/:id" element={<NotesPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </MobileLayout>
      </BibleProvider>
    </NotesProvider>
  );
}

export default function App() {
  return (
    <AuthProvider><ProtectedApp /></AuthProvider>
  );
}
