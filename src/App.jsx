import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotesProvider } from "./contexts/NotesContext";
import { BibleProvider } from "./contexts/BibleContext";
import AppLayout from "./components/layout/AppLayout";
import Login from "./components/auth/Login";
import LoadingScreen from "./components/ui/LoadingScreen";
import HomePage from "./pages/HomePage";
import BiblePage from "./pages/BiblePage";
import NotesPage from "./pages/NotesPage";
import StudyPage from "./pages/StudyPage";

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Login />;

  return (
    <NotesProvider>
      <BibleProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bible" element={<BiblePage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/:id" element={<NotesPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/study/:id" element={<StudyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BibleProvider>
    </NotesProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
