import { View, Text, ImageBackground, FlatList, TextInput, TouchableOpacity } from 'react-native'
import { StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from "@expo/vector-icons";
import firebase from '../config';

const database = firebase.database();
const ref_all_Discussion = database.ref("All_Discussion");

export default function Chat(props) {

  const currentId = props.route.params.currentId;
  const secondId = props.route.params.secondId;

  // Unique discussion ID
  const disc_id = currentId > secondId ? currentId + secondId : secondId + currentId;
  const ref_discussion = ref_all_Discussion.child(disc_id);
  
  // Correct typing references for both users
  const ref_currentUserTyping = ref_discussion.child(currentId + " is Typing");
  const ref_secondisTyping = ref_discussion.child(secondId + " is Typing");

  const [Input, setInput] = useState("");
  const [Messages, setMessages] = useState([]);
  const [secondisTyping, setsecondisTyping] = useState(false);

  // ⬇️ LISTEN TO MESSAGES FROM FIREBASE
  useEffect(() => {
    const ref_message = ref_discussion.child("Message");

    const messageListener = ref_message.on("value", (snapshot) => {
      if (snapshot.exists()) {
        const all = Object.values(snapshot.val());
        setMessages(all);
      }
    });

    const typingListener = ref_secondisTyping.on("value", (snapshot) => {
      setsecondisTyping(snapshot.val() === true);
    });

    return () => {
      ref_message.off("value", messageListener);
      ref_secondisTyping.off("value", typingListener);
    };
  }, []);

  // SEND MESSAGE
  const sendMessage = () => {
    if (!Input || Input.trim().length === 0) return;

    const ref_message = ref_discussion.child("Message");
    const keymsg = ref_message.push().key;

    const ref_un_msg = ref_message.child(keymsg);

    ref_un_msg.set({
      idmsg: keymsg,
      sender: currentId,
      receiver: secondId,
      message: Input,
      time: new Date().toLocaleString()
    }).then(() => {
      setInput("");  
    });
  };

  // RENDER MESSAGE STYLE
  const renderMessage = ({ item }) => {
    const isMe = item.sender === currentId;
    return (
      <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.otherMsg]}>
        <Text style={styles.msgText}>{item.message}</Text>
        <Text style={styles.msgTime}>{item.time}</Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.container}
    >

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat With {secondId}</Text>

        <View style={styles.headerIcons}>
          <Ionicons name="chatbubbles" size={26} color="#AEC16F" style={styles.icon} />
          <Ionicons name="call" size={26} color="#AEC16F" style={styles.icon} />
        </View>
      </View>

      {/* MESSAGES LIST */}
      <View style={styles.messagesContainer}>
        <FlatList
          data={Messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.idmsg}
        />
      </View>

      {/* TYPING INDICATOR */}
      {secondisTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{secondId} is typing...</Text>
        </View>
      )}

      {/* INPUT BAR */}
      <View style={styles.inputContainer}>

        <TouchableOpacity>
          <Ionicons name="link" size={26} color="#AEC16F" />
        </TouchableOpacity>

        <TextInput
          placeholder="Type a message..."
          placeholderTextColor="#ccc"
          style={styles.input}
          value={Input}
          onChangeText={setInput}
          onFocus={() => {
            ref_currentUserTyping.set(true);
          }}
          onBlur={() => {
            ref_currentUserTyping.set(false);
          }}
        />

        <TouchableOpacity>
          <Ionicons name="happy" size={26} color="#AEC16F" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:40,
    backgroundColor:"rgba(0,0,0,0.3)"
  },

  header:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    paddingHorizontal:20,
    paddingVertical:15,
    backgroundColor:"#fff",
  },

  headerText:{
    fontSize:22,
    color:"#AEC16F",
    fontWeight:"bold"
  },

  headerIcons:{
    flexDirection:"row",
  },
  icon:{
    marginLeft:15
  },

  messagesContainer:{
    flex:1,
    paddingHorizontal:15,
    marginTop:10,
  },

  msgBubble:{
    maxWidth:"75%",
    padding:10,
    borderRadius:10,
    marginVertical:5,
  },
  myMsg:{
    backgroundColor:"#AEC16F",
    alignSelf:"flex-end",
  },
  otherMsg:{
    backgroundColor:"#fff",
    alignSelf:"flex-start",
  },
  msgText:{
    fontSize:16,
    color:"#000"
  },
  msgTime:{
    fontSize:10,
    color:"#555",
    marginTop:5,
    textAlign:"right"
  },

  typingIndicator:{
    paddingHorizontal:20,
    paddingVertical:5,
  },
  typingText:{
    fontSize:12,
    color:"#fff",
    fontStyle:"italic"
  },

  inputContainer:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#fff",
    padding:10,
    borderRadius:30,
    marginHorizontal:10,
    marginBottom:15,
    elevation:4,
  },
  input:{
    flex:1,
    marginHorizontal:10,
    color:"#000",
    fontSize:16,
  },
  sendButton:{
    backgroundColor:"#AEC16F",
    padding:3,
    borderRadius:50,
    marginLeft:8,
  }
});