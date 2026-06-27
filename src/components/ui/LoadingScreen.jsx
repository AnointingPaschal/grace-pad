export default function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "linear-gradient(135deg, #160A47 0%, #3B1D8C 100%)" }}
    >
      {/* Logo mark */}
      <div className="w-16 h-16 rounded-2xl border border-gold/30 bg-gold/10 flex items-center justify-center animate-pulse">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M12 2L12 22M7 7L17 7M7 17L17 17" stroke="#C8971B" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="font-display text-white text-xl font-semibold tracking-wide">Grace Pad</span>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
