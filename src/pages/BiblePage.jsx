import BibleViewer from "../components/bible/BibleViewer";

export default function BiblePage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <BibleViewer />
    </div>
  );
}
