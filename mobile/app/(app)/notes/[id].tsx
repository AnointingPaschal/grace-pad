import { useLocalSearchParams, useRouter } from "expo-router";
import { useNotes } from "../../../src/contexts/NotesContext";
import NoteEditor from "../../../src/components/notes/NoteEditor";
import { View, ActivityIndicator } from "react-native";

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes } = useNotes();
  const router    = useRouter();
  const note = notes.find(n => n.id === id) ?? null;

  if (!note && !id) {
    return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}><ActivityIndicator /></View>;
  }

  return (
    <NoteEditor
      note={note}
      noteId={id as string}
      onBack={() => router.back()}
    />
  );
}
