import { useEffect } from "react";
import { X } from "lucide-react";

export default function BottomSheet({ open, onClose, title, children, maxHeight = "70vh" }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          background: "#7B1515",
          maxHeight,
          animation: "slideUp 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Handle + Title */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/30 absolute top-3 left-1/2 -translate-x-1/2" />
          <h3 className="font-display font-semibold text-white text-base mt-2">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-2"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 pb-8">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
