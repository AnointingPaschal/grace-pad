import { useState } from "react";
import { Link } from "react-router-dom";

const DARK_BLUE = "#160A47";
const MAROON    = "#7B1515";
const GOLD      = "#C8971B";

export default function DeleteDataPage() {
  const [step, setStep]     = useState(1); // 1=form, 2=submitted
  const [email, setEmail]   = useState("");
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !agreed) return;
    setLoading(true);

    // Send via mailto as a fallback — works without a backend
    const subject = encodeURIComponent("Grace Pad — Account & Data Deletion Request");
    const body = encodeURIComponent(
      `Account Deletion Request\n\nEmail: ${email}\nReason: ${reason || "Not specified"}\n\nThe user has confirmed they understand this action is irreversible.`
    );

    // Open mail client
    window.location.href = `mailto:ozoemenapaschal09@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 px-6 text-center text-white"
        style={{ background: `linear-gradient(160deg, ${MAROON} 0%, ${DARK_BLUE} 100%)` }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: GOLD }}>
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
            Grace Pad
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
          Delete My Account & Data
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          We respect your right to privacy. Submit this form to request permanent deletion of your
          Grace Pad account and all associated data.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-5 py-10">

        {step === 1 ? (
          <>
            {/* What gets deleted */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 text-lg"
                style={{ fontFamily: "Playfair Display, serif" }}>
                What will be deleted
              </h2>
              <ul className="space-y-3">
                {[
                  ["Your account", "Your Google Sign-In connection to Grace Pad will be removed."],
                  ["All notes", "Every note you created — including content, formatting, and tags."],
                  ["Bookmarks & highlights", "All verse bookmarks, highlights, and annotations."],
                  ["Study progress", "Your study plan progress, streaks, and reflection notes."],
                  ["Personal data", "Your name, email, and profile photo stored by Grace Pad."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-3 items-start">
                    <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: MAROON + "20" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke={MAROON} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{title}</p>
                      <p className="text-gray-500 text-sm">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning banner */}
            <div className="rounded-xl p-4 mb-6 border-l-4 border-red-400 bg-red-50">
              <p className="text-sm font-bold text-red-800 mb-1">⚠ This action is permanent</p>
              <p className="text-sm text-red-700">
                Once your data is deleted, it cannot be recovered. Please make sure you have saved
                anything you wish to keep before submitting this request.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
              <h2 className="font-bold text-gray-800 text-lg"
                style={{ fontFamily: "Playfair Display, serif" }}>
                Deletion Request Form
              </h2>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Your Grace Pad Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="The email you used to sign in"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Reason for leaving (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="We'd love to know how we can improve..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50 resize-none"
                />
              </div>

              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-gray-600">
                  I understand that this action is <strong className="text-gray-800">permanent and irreversible</strong>.
                  All my notes, bookmarks, highlights, and account data will be permanently deleted
                  within <strong className="text-gray-800">30 days</strong>.
                </span>
              </label>

              <button
                type="submit"
                disabled={!email || !agreed || loading}
                className="w-full py-4 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-40"
                style={{ backgroundColor: MAROON }}
              >
                {loading ? "Opening email client…" : "Submit Deletion Request"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                This will open your email app with a pre-filled deletion request to our team.
                Your request will be processed within 30 days.
              </p>
            </form>
          </>

        ) : (
          /* Success state */
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#DCFCE7" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 16L13 21L24 10" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Request Received
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Your deletion request for <strong>{email}</strong> has been submitted.
              Our team will process your request and permanently delete your account and all
              associated data within <strong>30 days</strong>.
            </p>
            <div className="rounded-xl p-4 bg-gray-50 text-left mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">What happens next</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• You will receive a confirmation email within 48 hours</li>
                <li>• Your data will be permanently deleted within 30 days</li>
                <li>• You can continue using the app until deletion is complete</li>
                <li>• After deletion, you may sign up again as a new user</li>
              </ul>
            </div>
            <Link to="/"
              className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold"
              style={{ backgroundColor: DARK_BLUE }}>
              Return to App
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-gray-100">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: DARK_BLUE + "10" }}>
            <span className="text-xs font-semibold" style={{ color: DARK_BLUE }}>
              Spiritgate Technologies — The Witness Team
            </span>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" className="hover:underline" style={{ color: DARK_BLUE }}>Privacy Policy</Link>
            <Link to="/terms"   className="hover:underline" style={{ color: DARK_BLUE }}>Terms of Service</Link>
            <Link to="/"        className="hover:underline" style={{ color: DARK_BLUE }}>Home</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
