import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, FlatList, TextInput, TouchableOpacity, Animated, Easing } from 'react-native';
import { StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import firebase from '../config';

export default function Chat(props) {
  const currentId = props.route.params.currentId;
  const secondId = props.route.params.secondId;

  const [secondName, setSecondName] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [secondIsTyping, setSecondIsTyping] = useState(false);

  const popAnimations = useRef({}).current;

  const discId = currentId > secondId ? currentId + secondId : secondId + currentId;
  const refDiscussion = firebase.database().ref("All_Discussion").child(discId);
  const refCurrentTyping = refDiscussion.child(currentId + " is Typing");
  const refSecondTyping = refDiscussion.child(secondId + " is Typing");

  // Fetch second user's name
  useEffect(() => {
    const refAccount = firebase.database().ref("Accounts").child(secondId);
    refAccount.once("value").then(snapshot => {
      if (snapshot.exists()) setSecondName(snapshot.val().Nom || 'Unknown');
    });
  }, [secondId]);

  // Listen to messages & typing
  useEffect(() => {
    const refMessages = refDiscussion.child("Message");

    const messageListener = refMessages.on("value", snapshot => {
      if (snapshot.exists()) {
        const all = Object.values(snapshot.val());
        setMessages(all);

        // Create animations for new messages
        all.forEach(msg => {
          if (!popAnimations[msg.idmsg]) popAnimations[msg.idmsg] = new Animated.Value(0);
        });

        all.forEach(msg => {
          Animated.spring(popAnimations[msg.idmsg], {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
          }).start();
        });
      }
    });

    const typingListener = refSecondTyping.on("value", snapshot => {
      setSecondIsTyping(snapshot.val() === true);
    });

    return () => {
      refMessages.off("value", messageListener);
      refSecondTyping.off("value", typingListener);
    };
  }, []);

  const sendMessage = () => {
    if (!input || input.trim() === '') return;
    const refMsg = refDiscussion.child("Message");
    const keyMsg = refMsg.push().key;
    const newMsgRef = refMsg.child(keyMsg);

    newMsgRef.set({
      idmsg: keyMsg,
      sender: currentId,
      receiver: secondId,
      message: input,
      time: new Date().toLocaleTimeString(),
    }).then(() => setInput(''));
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === currentId;
    return (
      <Animated.View style={{ 
        transform: [{ scale: popAnimations[item.idmsg] || 1 }],
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        marginVertical: 5,
      }}>
        <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.otherMsg]}>
          {!isMe && <Text style={styles.senderName}>{secondName}</Text>}
          <Text style={styles.msgText}>{item.message}</Text>
          <Text style={styles.msgTime}>{item.time}</Text>
        </View>
      </Animated.View>
    );
  };

  // Typing bubble component with bouncing dots
  const TypingBubble = () => {
    const dotAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (input.length === 0) return; // only animate if typing

      dotAnim.setValue(0); // reset
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 2, duration: 300, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 3, duration: 300, useNativeDriver: true }),
        ])
      );
      loop.start();

      return () => loop.stop(); // cleanup
    }, [input.length]);

    const dot1Y = dotAnim.interpolate({ inputRange: [0,1,2,3], outputRange: [0,-5,0,0] });
    const dot2Y = dotAnim.interpolate({ inputRange: [0,1,2,3], outputRange: [0,0,-5,0] });
    const dot3Y = dotAnim.interpolate({ inputRange: [0,1,2,3], outputRange: [0,0,0,-5] });

    return (
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot1Y }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot2Y }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot3Y }] }]} />
      </View>
    );
  };

  return (
    <ImageBackground source={require("../assets/bg.jpg")} style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat with {secondName}</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="chatbubbles" size={26} color="#FF84B7" style={styles.icon} />
          <Ionicons name="call" size={26} color="#FF84B7" style={styles.icon} />
        </View>
      </View>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.idmsg}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* TYPING BUBBLE */}
      {secondIsTyping && <TypingBubble />}

      {/* INPUT BAR */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor="#ccc"
          style={styles.input}
          value={input}
          onChangeText={text => {
            setInput(text);
            refCurrentTyping.set(text.length > 0);
          }}
          onBlur={() => refCurrentTyping.set(false)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDEBFF', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5 },
  headerText: { fontSize: 22, color: '#FF84B7', fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  icon: { marginLeft: 15 },
  msgBubble: { maxWidth: '75%', padding: 10, borderRadius: 15, backgroundColor: '#fff', shadowColor: '#FFB6E6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
  myMsg: { backgroundColor: '#FF84B7' },
  otherMsg: { backgroundColor: '#fff' },
  senderName: { fontWeight: '600', color: '#FF84B7', marginBottom: 3 },
  msgText: { fontSize: 16, color: '#000' },
  msgTime: { fontSize: 10, color: '#555', marginTop: 3, textAlign: 'right' },
  typingBubble: { flexDirection: 'row', backgroundColor: '#fff', padding: 8, borderRadius: 20, alignSelf: 'flex-start', marginLeft: 5, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF84B7', marginHorizontal: 2 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 30, margin: 10, elevation: 5 },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 16, color: '#333' },
  sendButton: { backgroundColor: '#FF84B7', padding: 10, borderRadius: 50, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
});
