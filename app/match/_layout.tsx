// app/match/_layout.tsx
import { Stack } from "expo-router";
export default function MatchStack() {
  return (
    <Stack>
      <Stack.Screen 
      name="[id]" 
      options={{ headerShown: false, title: "Maç Detayı" }}/>
    </Stack>
  );
}
