// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { AppStoreProvider } from "../src/context/AppStore";

export default function RootLayout() {
  return (
    <AppStoreProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppStoreProvider>
  );
}
