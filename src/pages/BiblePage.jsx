import BibleReader from "../components/bible/BibleReader";

export default function BiblePage() {
  // 52px header + 64px bottom nav — Bible fills the rest
  return (
    <div style={{ height: "calc(100dvh - 52px - 64px)" }} className="overflow-hidden bg-white">
      <BibleReader />
    </div>
  );
}
