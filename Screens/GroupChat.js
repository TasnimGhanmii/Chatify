import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
} from "react-native";
import firebase from "../config";
import { Ionicons } from "@expo/vector-icons";

export default function GroupChat({ route }) {
  const { groupId, groupName, currentId } = route.params;

  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});

  const animValue = useRef(new Animated.Value(0)).current;

  const pop = () => {
    animValue.setValue(0);
    Animated.spring(animValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  useEffect(() => {
    firebase
      .database()
      .ref("Accounts")
      .on("value", (snap) => {
        if (snap.exists()) {
          setAllUsers(snap.val());
        }
      });
  }, []);

  useEffect(() => {
    firebase
      .database()
      .ref("GroupMessages/" + groupId)
      .on("value", (snap) => {
        if (snap.exists()) {
          const arr = Object.entries(snap.val()).map(([id, msg]) => ({
            id,
            ...msg,
          }));
          setMessages(arr.reverse());
          pop();
        }
      });
  }, []);

  useEffect(() => {
    const ref = firebase.database().ref(`GroupTyping/${groupId}`);
    ref.on("value", (snap) => {
      setTypingUsers(snap.val() || {});
    });
    return () => ref.off();
  }, []);

  const handleTyping = (value) => {
    setText(value);
    firebase
      .database()
      .ref(`GroupTyping/${groupId}/${currentId}`)
      .set(value.length > 0);
    setTimeout(() => {
      firebase
        .database()
        .ref(`GroupTyping/${groupId}/${currentId}`)
        .set(false);
    }, 2000);
  };

  const sendMsg = () => {
    if (!text.trim()) return;
    firebase.database().ref("GroupMessages/" + groupId).push({
      sender: currentId,
      text,
      time: Date.now(),
    });
    setText("");
    firebase
      .database()
      .ref(`GroupTyping/${groupId}/${currentId}`)
      .set(false);
  };

  const renderMessage = ({ item }) => {
    const myMessage = item.sender === currentId;
    const senderName = allUsers[item.sender]?.Nom || "Unknown";
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    });
    return (
      <Animated.View
        style={[
          styles.msgContainer,
          { alignSelf: myMessage ? "flex-end" : "flex-start" },
          { transform: [{ scale }] },
        ]}
      >
        {!myMessage && <Text style={styles.sender}>{senderName}</Text>}
        <View
          style={[
            styles.bubble,
            myMessage ? styles.myBubble : styles.otherBubble,
          ]}
        >
          <Text style={styles.msgText}>{item.text}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderTyping = () => {
    const activeUsers = Object.keys(typingUsers).filter(
      (u) => typingUsers[u] && u !== currentId
    );
    if (activeUsers.length === 0) return null;
    const names = activeUsers.map((u) => allUsers[u]?.Nom || "Unknown");
    const typingText =
      names.length === 1
        ? `${names[0]} is typing...`
        : `${names.join(", ")} are typing...`;
    return (
      <View style={styles.typingTextContainer}>
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={26} color="#FF6FB5" />
        <Text style={styles.headerTxt}>{groupName}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ paddingTop: 15 }}
      />
      {renderTyping()}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMsg}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FCEAFF" },
  header: {
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: "#FFB6D5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 4,
  },
  headerTxt: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  msgContainer: {
    marginVertical: 5,
    maxWidth: "80%",
    paddingHorizontal: 10,
  },
  sender: {
    fontSize: 12,
    color: "#777",
    marginLeft: 8,
    marginBottom: 2,
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: "#FF8EC7",
    borderBottomRightRadius: 3,
  },
  otherBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 3,
  },
  msgText: {
    fontSize: 15,
    color: "#444",
  },
  typingTextContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 10,
  },
  typingText: {
    fontStyle: "italic",
    color: "#777",
    fontSize: 14,
  },
  inputArea: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#F7DFF1",
    padding: 12,
    borderRadius: 20,
    marginRight: 10,
    color: "#000",
  },
  sendBtn: {
    backgroundColor: "#FF6FB5",
    padding: 12,
    borderRadius: 50,
  },
});
