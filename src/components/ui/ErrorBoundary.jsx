import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Grace Pad crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center"
          style={{ background: "linear-gradient(135deg, #160A47 0%, #3B1D8C 100%)" }}
        >
          <div className="w-16 h-16 rounded-2xl border border-red-400/30 bg-red-500/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="font-display text-white text-2xl font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-white/50 font-body text-sm max-w-sm mb-1">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <p className="text-white/30 font-body text-xs">
              Check the browser console for details.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/10 hover:bg-white/20 text-white font-body text-sm px-6 py-2.5 rounded-xl transition-colors border border-white/20"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
