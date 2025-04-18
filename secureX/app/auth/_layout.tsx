import { Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const { authenticated, loading } = useAuth();

  // If user is already authenticated, redirect to home
  if (authenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f6fa" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
    </Stack>
  );
}