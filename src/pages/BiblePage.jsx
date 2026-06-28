import BibleReader from "../components/bible/BibleReader";

export default function BiblePage() {
  return (
    <div style={{ height: "calc(100dvh - 52px - 64px)" }} className="overflow-hidden">
      <BibleReader />
    </div>
  );
}
