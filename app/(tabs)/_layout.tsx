// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E1FAD3",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#788371" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="soccer-ball-o" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Maçlar",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: "Puanla",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cog" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
  name="create-match"
  options={{
    title: "Oluştur",
    tabBarIcon: ({ color, size }) => (
      <FontAwesome name="plus-square" size={size} color={color} />
    ),
  }}
/>

    </Tabs>
  );
}
