import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import firebase from "../../config";
import { Ionicons } from "@expo/vector-icons";

export default function Groups({ navigation, route }) {
  const currentId = route.params.currentId;

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  // Fetch all users
  useEffect(() => {
    firebase
      .database()
      .ref("Accounts")
      .on("value", (snap) => {
        if (snap.exists()) {
          const arr = Object.entries(snap.val()).map(([id, user]) => ({
            id,
            ...user,
          }));
          setAllUsers(arr.filter((u) => u.id !== currentId));
        }
      });

    // Fetch groups where the user is a member
    firebase
      .database()
      .ref("Groups")
      .on("value", (snap) => {
        if (snap.exists()) {
          const arr = Object.entries(snap.val()).map(([gid, g]) => ({
            gid,
            ...g,
          }));
          setGroups(arr.filter((g) => g.members && g.members[currentId]));
        }
      });
  }, []);

  // Toggle member selection
  const toggleUser = (id) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Create Group
  const createGroup = () => {
    if (!groupName.trim()) return alert("Enter a group name!");
    const members = { ...selectedUsers, [currentId]: true };

    const selected = Object.keys(members).filter((k) => members[k]);
    if (selected.length < 2) return alert("Select at least 2 members!");

    const ref = firebase.database().ref("Groups").push();
    ref.set({
      name: groupName,
      members,
    });

    setGroupName("");
    setSelectedUsers({});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a Group</Text>

      <TextInput
        placeholder="Group name..."
        placeholderTextColor="#aaa"
        value={groupName}
        onChangeText={setGroupName}
        style={styles.input}
      />

      <Text style={styles.subHeader}>Select Members</Text>

      <FlatList
        data={allUsers}
        style={{ maxHeight: 200 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const selected = selectedUsers[item.id];
          return (
            <TouchableOpacity
              style={[styles.userItem, selected && styles.selectedUser]}
              onPress={() => toggleUser(item.id)}
            >
              <Ionicons
                name={selected ? "checkbox" : "square-outline"}
                size={22}
                color="#FF84B7"
              />
              <Text style={styles.username}>{item.Nom}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.createBtn} onPress={createGroup}>
        <Text style={styles.createText}>Create Group</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Groups</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.gid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() =>
              navigation.navigate("GroupChat", {
                groupId: item.gid,
                groupName: item.name,
                currentId,
              })
            }
          >
            <Ionicons name="people" size={28} color="#FF84B7" />
            <Text style={styles.groupName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FDEBFF" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF84B7",
    marginVertical: 10,
  },
  subHeader: {
    fontSize: 18,
    color: "#FF84B7",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    marginBottom: 15,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#fff",
    marginVertical: 4,
  },
  selectedUser: {
    backgroundColor: "#FFD2EA",
  },
  username: {
    marginLeft: 10,
    fontSize: 16,
    color: "#444",
  },
  createBtn: {
    backgroundColor: "#FF84B7",
    padding: 12,
    borderRadius: 20,
    marginTop: 15,
    alignItems: "center",
  },
  createText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  groupCard: {
    backgroundColor: "#fff",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    marginVertical: 6,
  },
  groupName: {
    marginLeft: 12,
    fontSize: 18,
    color: "#444",
  },
});
