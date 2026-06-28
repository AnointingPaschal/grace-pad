import BibleReader from "../components/bible/BibleReader";

export default function BiblePage() {
  // full viewport minus top header (52px) minus bottom nav (64px)
  return (
    <div style={{ height: "calc(100dvh - 52px - 64px)" }} className="overflow-hidden">
      <BibleReader />
    </div>
  );
}
