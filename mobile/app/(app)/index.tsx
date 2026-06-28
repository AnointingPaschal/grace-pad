import { View } from "react-native";
import BibleReader from "../../src/components/bible/BibleReader";

export default function BibleScreen() {
  return (
    <View style={{ flex:1 }}>
      <BibleReader />
    </View>
  );
}
