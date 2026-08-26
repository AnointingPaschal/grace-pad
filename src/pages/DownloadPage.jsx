import { Link } from "react-router-dom";
import imgHome from "../assets/01_home.jpg";
import imgBible from "../assets/02_bible.jpg";
import imgCommentary from "../assets/03_commentary.jpg";
import imgSearch from "../assets/04_search.jpg";
import imgShare from "../assets/05_share.jpg";
import imgAskGrace from "../assets/06_ask_grace.jpg";
import imgStudy from "../assets/07_study.jpg";

const DARK_BLUE = "#160A47";
const GOLD = "#C8971B";

const SCREENSHOTS = [
  { id: 1, src: imgHome, alt: "Home Screen" },
  { id: 2, src: imgBible, alt: "Bible Reader" },
  { id: 3, src: imgCommentary, alt: "Bible Commentary" },
  { id: 4, src: imgAskGrace, alt: "Ask Grace AI" },
  { id: 5, src: imgStudy, alt: "Study Tools" },
  { id: 6, src: imgSearch, alt: "Advanced Search" },
  { id: 7, src: imgShare, alt: "Verse Sharing" },
];

export default function DownloadPage() {
  const apkLink = "https://drive.google.com/file/d/1ym8chnLcL_cTpPxslkaNF5KCWYcevLAP/view?usp=drivesdk";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-16 px-6 text-center text-white"
        style={{ background: `linear-gradient(160deg, ${DARK_BLUE} 0%, #3B1D8C 100%)` }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: GOLD }}>
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <span className="text-3xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>
            Grace Pad
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
          Experience the Word
        </h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Your ultimate companion for Bible study and deep theological exploration.
        </p>
        
        <a 
          href={apkLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105"
          style={{ backgroundColor: GOLD, color: "#fff", boxShadow: "0 10px 25px -5px rgba(200, 151, 27, 0.4)" }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Android APK
        </a>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 py-12">
        
        {/* Installation Disclaimer */}
        <div className="rounded-2xl p-6 mb-12 border max-w-3xl mx-auto"
          style={{ backgroundColor: "#FFF8EF", borderColor: "#C8971B40" }}>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: DARK_BLUE }}>
            <svg className="w-5 h-5" style={{ color: GOLD }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Installation Guide
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            Grace Pad is currently in the final internal testing phase before its official Google Play Store release. 
          </p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>When you open the downloaded file, your phone may ask for permission to <strong>"Install unknown apps"</strong>.</li>
            <li>Google Play Protect may show an "Unrecognized Developer" warning. You can safely tap <strong>"More details"</strong> and then <strong>"Install anyway"</strong>.</li>
          </ul>
        </div>

        {/* Gallery */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center"
            style={{ fontFamily: "Playfair Display, serif", color: DARK_BLUE }}>
            A Glimpse Inside
          </h2>
          
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x px-4 hide-scrollbar">
            {SCREENSHOTS.map((img) => (
              <div key={img.id} className="snap-center shrink-0">
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="h-[500px] w-auto rounded-3xl object-cover shadow-xl border border-gray-200"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <blockquote className="italic text-gray-500 text-sm mb-6">
            "Your word is a lamp for my feet, a light on my path." — Psalm 119:105
          </blockquote>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" className="hover:underline" style={{ color: DARK_BLUE }}>Privacy Policy</Link>
            <Link to="/terms" className="hover:underline" style={{ color: DARK_BLUE }}>Terms of Service</Link>
            <Link to="/" className="hover:underline" style={{ color: DARK_BLUE }}>Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
