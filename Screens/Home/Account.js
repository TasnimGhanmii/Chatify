import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import firebase, { supabase } from "../../config";

const { width, height } = Dimensions.get("window");

const database = firebase.database();
const ref_all_account = database.ref().child("Accounts");

// ───────────────────────────────────────────────
// ❤️ HEART PARTICLE COMPONENT
// ───────────────────────────────────────────────

const HeartParticle = ({ x, y }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  Animated.parallel([
    Animated.timing(translateY, {
      toValue: -80,
      duration: 1200,
      useNativeDriver: true,
    }),
    Animated.timing(opacity, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }),
  ]).start();

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <Svg width="28" height="28" viewBox="0 0 24 24" fill="#ff6fb3">
        <Path d="M12 21s-1-.6-2.5-2C6.1 16 3 12.1 3 8.5 3 5.4 5.4 3 8.5 3c1.7 0 3.3.8 4.5 2.1C14.2 3.8 15.8 3 17.5 3 20.6 3 23 5.4 23 8.5c0 3.6-3.1 7.5-6.5 10.5C13 20.4 12 21 12 21z" />
      </Svg>
    </Animated.View>
  );
};

export default function Account(props) {
  const currentId = props.route.params.currentId;
  const ref_account = ref_all_account.child(currentId);

  const [Nom, setNom] = useState("");
  const [Pseudo, setPseudo] = useState("Anonyme");
  const [Email, setEmail] = useState("");
  const [Numero, setNumero] = useState("");
  const [UserImage, setUserImage] = useState(null);

  const [level] = useState(() => Math.floor(Math.random() * 50) + 1);
  const [hearts, setHearts] = useState([]);

  // Animated pastel background
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating looping gradient
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: false,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 9000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Load account data
    ref_account.once("value").then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setNom(data.Nom ?? "");
        setPseudo(data.Pseudo ?? "Anonyme");
        setEmail(data.Email ?? "");
        setNumero(data.Numero ?? "");
        setUserImage(data.UserImage ?? null);
      }
    });
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) setUserImage(result.assets[0].uri);
  };

  // Add heart particles
  const spawnHearts = () => {
    const newHearts = [];
    for (let i = 0; i < 6; i++) {
      newHearts.push({
        id: Math.random().toString(),
        x: width * 0.45 + Math.random() * 40 - 20,
        y: height * 0.55 + Math.random() * 30 - 10,
      });
    }
    setHearts([...hearts, ...newHearts]);

    // Remove after animation
    setTimeout(() => {
      setHearts((prev) => prev.slice(newHearts.length));
    }, 1300);
  };

  // Interpolate background colors
  const bgColor1 = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffd6f4", "#d6e7ff"],
  });
  const bgColor2 = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffe4f2", "#e5d6ff"],
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Animated Pastel Background Gradient */}
      <Animated.View style={[styles.animatedBg, { backgroundColor: bgColor1 }]} />
      <Animated.View style={[styles.animatedBg2, { backgroundColor: bgColor2 }]} />

      {/* Floating header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{Pseudo} 💫</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        {/* Profile Image */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
          <Image
            source={
              UserImage
                ? { uri: UserImage }
                : require("../../assets/icon.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv {level}</Text>
        </View>

        <Text style={styles.title}>My Account</Text>

        {/* Gradient Inputs */}
        <LinearGradient colors={["#ffb8e2", "#ffd6f7"]} style={styles.inputWrapper}>
          <TextInput
            value={Nom}
            onChangeText={setNom}
            placeholder="Full Name"
            placeholderTextColor="#fff"
            style={styles.input}
          />
        </LinearGradient>

        <LinearGradient colors={["#f7c2ff", "#d6c7ff"]} style={styles.inputWrapper}>
          <TextInput
            value={Pseudo}
            onChangeText={setPseudo}
            placeholder="Pseudo"
            placeholderTextColor="#fff"
            style={styles.input}
          />
        </LinearGradient>

        <LinearGradient colors={["#ffc4e8", "#ffd9ef"]} style={styles.inputWrapper}>
          <TextInput
            value={Email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#fff"
            style={styles.input}
          />
        </LinearGradient>

        <LinearGradient colors={["#e7c5ff", "#dcc8ff"]} style={styles.inputWrapper}>
          <TextInput
            value={Numero}
            onChangeText={setNumero}
            placeholder="Phone Number"
            placeholderTextColor="#fff"
            style={styles.input}
          />
        </LinearGradient>

        {/* Save button with heart particles */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            spawnHearts(); // ❤️ shower effect
            ref_account.set({
              Id: currentId,
              Nom, Pseudo, Email, Numero, UserImage,
            });
          }}
        >
          <Text style={styles.saveText}>Save ✨</Text>
        </TouchableOpacity>

        {/* Render heart particles */}
        {hearts.map((h) => (
          <HeartParticle key={h.id} x={h.x} y={h.y} />
        ))}
      </View>

      <StatusBar style="light" />
    </View>
  );
}

// ─────────────────────────────────────────────
// 🌸 STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  animatedBg: {
    position: "absolute",
    width,
    height,
    opacity: 0.6,
  },
  animatedBg2: {
    position: "absolute",
    width,
    height,
    opacity: 0.4,
  },

  header: {
    marginTop: 50,
    alignSelf: "center",
    padding: 12,
    paddingHorizontal: 26,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 30,
    backdropFilter: "blur(10px)",
  },

  headerText: {
    fontSize: 22,
    color: "#ff5fa8",
    fontWeight: "bold",
  },

  card: {
    marginTop: 30,
    width: "92%",
    alignSelf: "center",
    padding: 25,
    borderRadius: 30,
    backgroundColor: "rgba(255, 240, 247, 0.9)",
    alignItems: "center",

    shadowColor: "#ff9acb",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },

  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: "#ff8ac9",
  },

  levelBadge: {
    marginTop: -30,
    backgroundColor: "#ff77bc",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: "#ff5fa8",
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },

  levelText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  title: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: "700",
    color: "#ff52a3",
    marginBottom: 18,
  },

  inputWrapper: {
    width: "100%",
    borderRadius: 25,
    padding: 2,
    marginBottom: 12,
  },

  input: {
    height: 52,
    borderRadius: 25,
    paddingHorizontal: 15,
    color: "white",
    fontSize: 16,
  },

  saveButton: {
    marginTop: 16,
    backgroundColor: "#ff73c6",
    paddingVertical: 14,
    width: "75%",
    borderRadius: 28,
    shadowColor: "#ff73c6",
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },

  saveText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
});
