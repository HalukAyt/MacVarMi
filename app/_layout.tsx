// app/_layout.tsx
import { Slot } from "expo-router";
import { AppStoreProvider } from "../src/context/AppStore";

export default function RootLayout() {
  return (
    <AppStoreProvider>
      <Slot />
    </AppStoreProvider>
  );
}
