import { useState } from "react";
import { Menu, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { useLocation, Link } from "react-router-dom";
import { useNotes } from "../../contexts/NotesContext";
import { Toaster } from "react-hot-toast";

const PAGE_TITLES = {
  "/":      "Home",
  "/bible": "Bible",
  "/notes": "My Notes",
  "/study": "Study Room",
};

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { createNote } = useNotes();
  const title = PAGE_TITLES[location.pathname] ?? "Grace Pad";

  const handleNewNote = async () => {
    const id = await createNote();
    window.location.href = `/notes/${id}`;
  };

  return (
    <div className="min-h-screen bg-parchment flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content – offset by sidebar width on large screens */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-parchment/90 backdrop-blur-md border-b border-parchment-dark flex items-center gap-3 px-4 lg:px-6 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-royal transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="font-display text-scripture font-semibold text-lg flex-1">{title}</h1>

          <div className="flex items-center gap-2">
            <Link
              to="/notes/new"
              className="hidden sm:flex items-center gap-2 bg-royal hover:bg-royal-light text-white text-sm font-body font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              + New Note
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontFamily: "Inter, sans-serif", fontSize: "14px", borderRadius: "10px" },
          success: { iconTheme: { primary: "#C8971B", secondary: "#fff" } },
        }}
      />
    </div>
  );
}
