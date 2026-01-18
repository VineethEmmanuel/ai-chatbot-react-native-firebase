import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";

import { COLORS } from "./constants/theme";
import ChatScreen from "./screens/ChatScreen";
import { auth } from "./firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Sign in anonymously if no user
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(console.error);
    }

    return unsubscribe;
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          backgroundColor: COLORS.primary,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.primaryDark,
        }}
      >
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          AI Career Coach
        </Text>
      </View>
      <StatusBar style="auto" />
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // or '#f0f0f0' to debug
  },
});
