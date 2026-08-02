import { Link } from "react-router-dom";

const DARK_BLUE = "#160A47";
const GOLD      = "#C8971B";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100"
        style={{ fontFamily: "Playfair Display, serif", color: DARK_BLUE }}>
        {title}
      </h2>
      <div className="space-y-3 text-gray-600 leading-relaxed text-[15px]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 px-6 text-center text-white"
        style={{ background: "linear-gradient(160deg, #160A47 0%, #3B1D8C 100%)" }}>
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
          Privacy Policy
        </h1>
        <p className="text-white/60 text-sm">Last updated: August 2, 2026</p>
        <p className="text-white/50 text-xs mt-1">
          Maintained by the Witness Team — Spiritgate Technologies
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-10">

        {/* Quick summary card */}
        <div className="rounded-2xl p-5 mb-10 border"
          style={{ backgroundColor: "#FFF8EF", borderColor: "#C8971B40" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: GOLD }}>✦ Quick Summary</p>
          <p className="text-gray-700 text-sm leading-relaxed">
            Grace Pad collects only what is necessary to provide the app. We do not sell your data,
            serve ads, or share your notes with anyone. Your content is yours — private and protected.
          </p>
        </div>

        <Section title="1. Introduction">
          <p>
            Welcome to Grace Pad, developed and maintained by{" "}
            <strong className="text-gray-800">Spiritgate Technologies — The Witness Team</strong>.
            This Privacy Policy explains how we collect, use, and protect your information when you
            use the Grace Pad mobile and web application.
          </p>
          <p>
            By using Grace Pad, you agree to the collection and use of information in accordance with this policy.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            <strong className="text-gray-800">Account Information:</strong> When you sign in with
            Google, we receive your name, email address, and profile photo from your Google account.
          </p>
          <p>
            <strong className="text-gray-800">Notes and Content:</strong> The notes, highlights,
            bookmarks, and scripture annotations you create are stored privately in your account.
          </p>
          <p>
            <strong className="text-gray-800">Study Progress:</strong> Your Bible study plan
            progress, streaks, and day completions are saved to your account.
          </p>
          <div className="rounded-xl p-4 mt-2 border-l-4 border-green-500 bg-green-50">
            <p className="text-sm text-green-800 font-semibold mb-1">We do NOT collect:</p>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Your precise location</li>
              <li>Your contacts, camera, or microphone</li>
              <li>Financial or payment information</li>
              <li>Any data without your knowledge</li>
            </ul>
          </div>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <strong className="text-gray-800">To provide the App:</strong> Sync your notes,
              bookmarks, highlights, and study progress across sessions.
            </li>
            <li>
              <strong className="text-gray-800">To authenticate you:</strong> Verify your identity
              so only you can access your content.
            </li>
            <li>
              <strong className="text-gray-800">To improve the App:</strong> Understand how the App
              is used so we can fix issues and add better features.
            </li>
            <li>
              <strong className="text-gray-800">To send reminders:</strong> Deliver devotional and
              study notifications if you have enabled them. These are scheduled locally on your
              device and do not involve any tracking server.
            </li>
          </ul>
        </Section>

        <Section title="4. Data Security">
          <p>
            We take the security of your data seriously. Your account and content are protected
            using industry-standard encryption, both in transit and at rest. Access controls ensure
            that only you can read or modify your own notes and data. No other user or third party
            can access your personal content.
          </p>
          <p>
            Some data is also stored locally on your device so that Grace Pad works even when
            you are offline.
          </p>
        </Section>

        <Section title="5. Children's Privacy">
          <p>
            Grace Pad is not directed at children under the age of 13. We do not knowingly collect
            personal information from children under 13. If you believe your child has provided
            personal information through the App, please contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate personal data</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Withdraw consent at any time by signing out and uninstalling the App</li>
            <li>Opt out of notifications at any time via your device settings</li>
          </ul>
        </Section>

        <Section title="7. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Continued use of the App after
            any changes constitutes your acceptance of the updated policy. The "Last updated" date
            at the top of this page will always reflect the most recent version.
          </p>
        </Section>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-gray-100">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: DARK_BLUE + "10" }}>
            <span className="text-xs font-semibold" style={{ color: DARK_BLUE }}>
              Spiritgate Technologies — The Witness Team
            </span>
          </div>
          <blockquote className="italic text-gray-500 text-sm mb-4">
            "Your word is a lamp for my feet, a light on my path." — Psalm 119:105
          </blockquote>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/terms" className="hover:underline" style={{ color: DARK_BLUE }}>
              Terms of Service
            </Link>
            <Link to="/" className="hover:underline" style={{ color: DARK_BLUE }}>
              Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
