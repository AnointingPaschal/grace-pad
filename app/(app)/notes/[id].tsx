import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useNotes } from "../../../src/contexts/NotesContext";
import NoteEditor from "../../../src/components/notes/NoteEditor";
import { C } from "../../../src/constants";

export default function NoteScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const { notes } = useNotes();
  const router    = useRouter();
  const note      = notes.find(n => n.id === id) ?? null;

  if (!id) return (
    <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
      <ActivityIndicator color={C.DARK_BLUE}/>
    </View>
  );

  return (
    <NoteEditor
      note={note}
      noteId={id}
      onBack={() => router.back()}
    />
  );
}
