import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index"    options={{ headerShown: false}}/>
      <Stack.Screen name="register"   options={{ headerShown: true, title: "" }}/>
      <Stack.Screen name="login"   options={{ headerShown: true, title: "" }}/>
      <Stack.Screen name="settings"   options={{ headerShown: true, title: "" }}/>
    </Stack>
  );
}


