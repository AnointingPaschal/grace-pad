import { useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { BookOpen, Star } from "lucide-react";

const GOOGLE_CLIENT_ID =
  "797228686427-1mfoj00i35hab40nt0846q54fqc9m6fq.apps.googleusercontent.com";

export default function Login() {
  const { signInWithGoogle, loading } = useAuth();
  const googleBtnRef = useRef(null);

  // Render Google's styled button as a fallback
  useEffect(() => {
    const render = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: 300,
        });
      }
    };
    if (window.google?.accounts?.id) {
      render();
    } else {
      const t = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(t); render(); }
      }, 200);
      return () => clearInterval(t);
    }
  }, []);

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Left panel – brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{
          background: "linear-gradient(160deg, #160A47 0%, #2D1777 60%, #3B1D8C 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2L12 22M7 7L17 7M7 17L17 17" stroke="#C8971B" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-display text-xl font-semibold tracking-wide">Grace Pad</span>
        </div>

        {/* Hero */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-gold/80 text-sm uppercase tracking-[0.2em] font-body font-medium">
              Your Sacred Study Space
            </p>
            <h1 className="font-display text-5xl text-white leading-[1.15]">
              Write. Study.<br />
              <span className="text-gold">Meditate.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed max-w-sm">
              Gospel notes, multi-translation Bible study, and spiritual journaling —
              all in one beautifully crafted space.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Rich-text sermon and study notes",
              "Multi-translation Bible reader (.tw format)",
              "Verse highlighting and tagging",
              "Syncs across all your devices via Google",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <Star className="w-4 h-4 text-gold shrink-0" fill="#C8971B" />
                <span className="text-white/70 font-body text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <blockquote className="border-l-2 border-gold/40 pl-4">
          <p className="text-white/50 font-scripture italic text-base leading-relaxed">
            "Thy word is a lamp unto my feet, and a light unto my path."
          </p>
          <cite className="text-gold/60 font-body text-xs tracking-wide mt-2 block">
            — Psalm 119:105 KJV
          </cite>
        </blockquote>
      </div>

      {/* Right panel – sign in */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#160A47" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 2L12 22M7 7L17 7M7 17L17 17" stroke="#C8971B" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-sidebar">Grace Pad</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl text-scripture font-semibold">Welcome</h2>
            <p className="text-gray-500 font-body text-sm">
              Sign in with your Google account to start your study.
            </p>
          </div>

          {/* Sign-in card */}
          <div className="bg-white rounded-2xl shadow-card p-8 space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-parchment flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-royal" />
              </div>
              <p className="text-gray-400 text-xs font-body pt-2">
                Grace Pad uses your Google account — no separate password needed.
                On most devices it signs you in automatically.
              </p>
            </div>

            {/* Google One Tap renders itself into the DOM automatically.
                This div holds the rendered Google button as a fallback. */}
            <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />

            {/* Secondary fallback */}
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-royal hover:shadow-card-hover rounded-xl py-3.5 px-4 font-body font-medium text-gray-700 transition-all duration-200 disabled:opacity-50 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-gray-400 font-body leading-relaxed">
              Your notes sync securely to your personal Google account and are accessible on all your signed-in devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
