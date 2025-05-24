import { auth } from "@/config/firebase";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Dashboard() {

  useEffect(() => {
    console.log("Settings");
    console.log(auth.currentUser);
  }, []);


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Text>Settings</Text>
    </View>
  );
}