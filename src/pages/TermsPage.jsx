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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-12 px-6 text-center text-white"
        style={{ background: "linear-gradient(160deg, #7B1515 0%, #160A47 100%)" }}>
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
          Terms of Service
        </h1>
        <p className="text-white/60 text-sm">Last updated: August 2, 2026</p>
        <p className="text-white/50 text-xs mt-1">
          Maintained by the Witness Team — Spiritgate Technologies
        </p>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-10">

        <Section title="1. Acceptance of Terms">
          <p>
            By downloading, installing, or using Grace Pad, you agree to be bound by these Terms of Service.
            If you do not agree to these Terms, do not use the App.
          </p>
          <p>
            These Terms constitute a legal agreement between you and{" "}
            <strong className="text-gray-800">Spiritgate Technologies — The Witness Team</strong>,
            the developer and maintainer of Grace Pad.
          </p>
        </Section>

        <Section title="2. Description of the App">
          <p>Grace Pad is a free, faith-based mobile and web application offering:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>A multi-translation Bible reader with verse highlighting, bookmarking, and annotation</li>
            <li>Cloud-synced personal notes with a rich text editor</li>
            <li>Bible study plans with progress tracking and streaks</li>
            <li>AI-assisted study guides and a study companion named Grace</li>
            <li>Sermon notes published by the team</li>
            <li>Verse-of-the-Day and offline devotional notifications</li>
          </ul>
        </Section>

        <Section title="3. Eligibility">
          <p>
            You must be at least <strong className="text-gray-800">13 years of age</strong> to use Grace Pad.
            By using the App, you represent that you meet this requirement. Users between 13 and 18 must have
            parental or guardian consent.
          </p>
        </Section>

        <Section title="4. User Accounts">
          <p><strong className="text-gray-800">Google Sign-In:</strong> Grace Pad uses Google Sign-In for authentication. By signing in, you authorize us to access basic Google account information as described in our Privacy Policy.</p>
          <p><strong className="text-gray-800">Guest Access:</strong> Bible reading and search are available without signing in. Cloud notes and study plan syncing require a signed-in account.</p>
          <p><strong className="text-gray-800">Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your Google account.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree to use Grace Pad only for lawful, personal, and non-commercial purposes. You agree NOT to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the App to harass, abuse, or harm others</li>
            <li>Attempt to reverse-engineer or tamper with the App</li>
            <li>Use automated tools or bots to access backend services</li>
            <li>Upload content that is unlawful, offensive, or infringes on rights of others</li>
            <li>Attempt to gain unauthorized access to other users' data</li>
            <li>Use the AI features to generate harmful or deceptive content</li>
          </ul>
        </Section>

        <Section title="6. User-Generated Content">
          <p><strong className="text-gray-800">Your Notes:</strong> The notes, highlights, and annotations you create are your own. You retain ownership of all content you create within the App.</p>
          <p><strong className="text-gray-800">License to Store:</strong> By using the App, you grant us a limited, non-exclusive license to store your content in Firebase solely to provide the App's functionality to you.</p>
          <p><strong className="text-gray-800">Content Standards:</strong> You agree not to create or store content that is illegal, infringes copyright, or contains malware.</p>
        </Section>

        <Section title="7. AI-Generated Content">
          <div className="rounded-xl p-4 border-l-4 border-yellow-400 bg-yellow-50">
            <p className="text-sm text-yellow-800 font-semibold mb-1">Important Notice</p>
            <p className="text-sm text-yellow-700">
              AI-generated content is for educational and devotional purposes only.
              AI responses may occasionally be inaccurate. Always verify theological claims against Scripture.
              The AI companion is not a substitute for pastoral counsel or theological training.
            </p>
          </div>
        </Section>

        <Section title="8. Sermons and Team Content">
          <p>Sermon notes published in the App are provided by Spiritgate Technologies — The Witness Team. This content is provided for personal edification and study, and may not be republished or sold without permission.</p>
        </Section>

        <Section title="9. Intellectual Property">
          <p>
            All original content, design, code, and branding of Grace Pad are the intellectual property of
            Spiritgate Technologies — The Witness Team.
          </p>
          <p>You may not copy, distribute, sell, or create derivative works based on the App's code or design without written permission.</p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            Grace Pad is provided <strong className="text-gray-800">"as is"</strong> and{" "}
            <strong className="text-gray-800">"as available"</strong> without warranties of any kind.
            We do not warrant that the App will be uninterrupted, error-free, or that AI-generated content
            will be theologically accurate.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, Spiritgate Technologies shall not be liable
            for any indirect, incidental, or consequential damages arising from your use of Grace Pad,
            including loss of data, loss of study progress, or reliance on AI-generated theological content.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Continued use of the App after changes constitutes
            acceptance of the revised Terms. The "Last updated" date will always reflect the most recent version.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms are governed by the laws of the Federal Republic of Nigeria.
            Any disputes arising from these Terms shall be resolved in the courts of Nigeria.
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
            "Grace Pad is built to serve the Body of Christ. We ask that you use it in the same spirit."
          </blockquote>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" className="hover:underline" style={{ color: DARK_BLUE }}>Privacy Policy</Link>
            <Link to="/" className="hover:underline" style={{ color: DARK_BLUE }}>Home</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
