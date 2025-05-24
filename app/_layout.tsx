import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="(portal)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Homepage"
        options={{
          headerShown: true,
          title: "Home",
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => router.push("/profile")}
            >
              <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="document"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
