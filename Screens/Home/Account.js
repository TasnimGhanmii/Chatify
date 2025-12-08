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
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import firebase, { supabase } from "../../config";

const auth = firebase.auth();
const { width, height } = Dimensions.get("window");
const database = firebase.database();
const ref_all_account = database.ref().child("Accounts");

export default function Account(props) {
  const currentId = props.route.params.currentId;
  const ref_account = ref_all_account.child(currentId);

  const [Nom, setNom] = useState("");
  const [Pseudo, setPseudo] = useState("Anonyme");
  const [Email, setEmail] = useState("");
  const [Numero, setNumero] = useState("");
  const [UserImage, setUserImage] = useState(null);

  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    // Load user data
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
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setUserImage(localUri);

      try {
        const ext = localUri.split(".").pop();
        const fileName = `${currentId}.${ext}`;

        const response = await fetch(localUri);
        const blob = await response.blob();

        const { error } = await supabase.storage
          .from("images")
          .upload(fileName, blob, { upsert: true });

        if (error) throw error;

        const { data, error: urlError } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        if (urlError) throw urlError;

        setUserImage(data.publicUrl); // ✅ Update state with public URL
        alert("Profile picture uploaded!");
      } catch (err) {
        console.log(err);
        alert("Upload failed: " + err.message);
      }
    }
  };

  const saveProfile = async () => {
    try {
      await ref_account.set({
        Id: currentId,
        Nom,
        Pseudo,
        Email,
        Numero,
        UserImage, // ✅ Use consistent key
      });
      alert("Profile saved!");
    } catch (err) {
      console.log(err);
      alert("Failed to save profile: " + err.message);
    }
  };

  const deleteUserAccount = async () => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) return alert("No user logged in!");

      const ext = UserImage?.split(".").pop().toLowerCase();
      if (UserImage && ext) {
        const { error } = await supabase.storage
          .from("images")
          .remove([currentUser.uid + "." + ext]);
        if (error) console.log("Supabase deletion error:", error.message);
      }

      await ref_account.remove();
      await currentUser.delete();

      alert("Compte supprimé avec succès !");
      props.navigation.replace("Auth");
    } catch (error) {
      console.log("Erreur suppression:", error);
      if (error.code === "auth/requires-recent-login") {
        alert("Veuillez vous reconnecter pour supprimer votre compte.");
        props.navigation.replace("Auth");
      } else {
        alert("Impossible de supprimer le compte : " + error.message);
      }
    }
  };

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
      <Animated.View style={[styles.animatedBg, { backgroundColor: bgColor1 }]} />
      <Animated.View style={[styles.animatedBg2, { backgroundColor: bgColor2 }]} />

      <View style={styles.header}>
        <Text style={styles.headerText}>{Pseudo} 💫</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
            <Image
              source={UserImage ? { uri: UserImage } : require("../../assets/icon.png")}
              style={styles.profileImage}
            />
          </TouchableOpacity>

          <Text style={styles.title}>My Account</Text>

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

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveText}>Save ✨</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={async () => {
              try {
                await auth.signOut();
                alert("Déconnecté !");
                props.navigation.replace("Auth");
              } catch (e) {
                console.log("Erreur signOut:", e);
              }
            }}
          >
            <Text style={styles.saveText}>Deconnect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              Alert.alert(
                "Confirmation",
                "Voulez-vous vraiment supprimer votre compte ?",
                [
                  { text: "Annuler", style: "cancel" },
                  { text: "Supprimer", style: "destructive", onPress: deleteUserAccount },
                ],
                { cancelable: false }
              );
            }}
          >
            <Text style={styles.saveText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  animatedBg: { position: "absolute", width, height, opacity: 0.6 },
  animatedBg2: { position: "absolute", width, height, opacity: 0.4 },
  header: {
    marginTop: 50,
    alignSelf: "center",
    padding: 12,
    paddingHorizontal: 26,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 30,
    backdropFilter: "blur(10px)",
  },
  headerText: { fontSize: 22, color: "#ff5fa8", fontWeight: "bold" },
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
  profileImage: { width: 130, height: 130, borderRadius: 80, borderWidth: 4, borderColor: "#ff8ac9" },
  title: { marginTop: 10, fontSize: 26, fontWeight: "700", color: "#ff52a3", marginBottom: 18 },
  inputWrapper: { width: "100%", borderRadius: 25, padding: 2, marginBottom: 12 },
  input: { height: 52, borderRadius: 25, paddingHorizontal: 15, color: "white", fontSize: 16 },
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
  saveText: { textAlign: "center", color: "white", fontWeight: "700", fontSize: 18 },
});
