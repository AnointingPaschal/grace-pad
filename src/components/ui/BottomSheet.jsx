import { useEffect } from "react";
import { X } from "lucide-react";

const DARK_BLUE = "#160A47";
const MID_BLUE  = "#2D1777";

export default function BottomSheet({ open, onClose, title, children, maxHeight = "70vh" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${DARK_BLUE} 0%, ${MID_BLUE} 100%)`,
          maxHeight,
          animation: "slideUp 0.22s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-0 shrink-0" />
        {/* Title row */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <h3 className="font-display font-semibold text-white text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-8">{children}</div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </>
  );
}
