import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Image } from "react-native";
import firebase from "../../config";
import { Ionicons } from "@expo/vector-icons";

const database = firebase.database();
const ref_all_account = database.ref().child("Accounts");

export default function List(props) {
  const [data, setdata] = useState([]);
  const currentId = props.route.params.currentId;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ref_all_account.on("value", (snapshot) => {
      let d = [];
      snapshot.forEach((oneaccount) => {
        d.push(oneaccount.val());
      });
      setdata(d);

      // Fade UI when loaded
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    });

    return () => ref_all_account.off();
  }, []);

  // Animated card press effect
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
      imageStyle={{ opacity: 0.28 }}
    >
      <Text style={styles.title}>🌸 Liste des comptes</Text>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Animated.View
              style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={pressIn}
                onPressOut={pressOut}
              >
                <View style={styles.innerCard}>
                  <Image
                    source={require("../../assets/icon.png")}
                    style={styles.avatar}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.Nom}</Text>
                    <Text style={styles.pseudo}>@{item.Pseudo}</Text>
                    <Text style={styles.numero}>{item.Numero}</Text>

                    <View style={styles.iconRow}>
                      <TouchableOpacity
                        onPress={() =>
                          props.navigation.navigate("Chat", {
                            secondId: item.Id,
                            currentId: currentId,
                          })
                        }
                        style={styles.iconButton}
                      >
                        <Ionicons
                          name="chatbubbles"
                          size={24}
                          color="#FF9ECD"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.iconButton}>
                        <Ionicons
                          name="chatbox-ellipses"
                          size={24}
                          color="#A788F5"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="call" size={24} color="#9EE7FF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 40,
    backgroundColor: "#FDEBFF",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FF77C4",
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#FFB6E6",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  innerCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 100,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#FFC8EC",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6D3D6D",
  },

  pseudo: {
    fontSize: 15,
    color: "#B47AAE",
  },

  numero: {
    fontSize: 14,
    color: "#8F8F8F",
    marginBottom: 4,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 5,
  },

  iconButton: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 8,
    borderRadius: 50,
    elevation: 3,
  },
});
