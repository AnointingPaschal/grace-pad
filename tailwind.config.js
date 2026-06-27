/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: "#160A47",
        "sidebar-light": "#1E1060",
        gold: "#C8971B",
        "gold-light": "#EAB83A",
        parchment: "#F8F5EE",
        "parchment-dark": "#EDE8DC",
        scripture: "#2D2418",
        royal: "#3B1D8C",
        "royal-light": "#5A35C0",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        scripture: ["'EB Garamond'", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(59, 29, 140, 0.08)",
        "card-hover": "0 8px 32px rgba(59, 29, 140, 0.15)",
        "gold-glow": "0 0 20px rgba(200, 151, 27, 0.3)",
      },
    },
  },
  plugins: [],
};
