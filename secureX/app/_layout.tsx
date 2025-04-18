import { Stack } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { Redirect } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {authenticated ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // User is not signed in
        <>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </>
      )} 
    </Stack>
  );
}
