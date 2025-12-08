import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import { useState, useRef } from 'react';
import firebase from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const auth = firebase.auth();

export default function Auth(props) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  const submitAnim = useRef(new Animated.Value(1)).current;

  const handleSignIn = () => {
    Animated.sequence([
      Animated.timing(submitAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(submitAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    auth.signInWithEmailAndPassword(email, pwd)
      .then(() => {
        const uid = auth.currentUser.uid;
        props.navigation.replace('Home', { currentId: uid });
      })
      .catch((error) => alert(error.message));
  };

  return (
    <ImageBackground
      source={require('../assets/bg.jpg')}
      style={styles.container}
    >
      <LinearGradient colors={['#FFD6EB', '#FDEBFF']} style={styles.card}>
        <Text style={styles.title}>Welcome</Text>

        <LinearGradient colors={['#FFE7F7', '#FFD6EB']} style={styles.inputWrapper}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#c88bb1"
            style={styles.input}
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />
        </LinearGradient>

        <LinearGradient colors={['#FFE7F7', '#FFD6EB']} style={styles.inputWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#c88bb1"
            style={styles.input}
            secureTextEntry
            onChangeText={setPwd}
            value={pwd}
          />
        </LinearGradient>

        <View style={styles.buttonRow}>
          <Animated.View style={{ transform: [{ scale: submitAnim }] }}>
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.button} onPress={() => alert('Exit pressed')}>
            <Text style={styles.buttonText}>Exit</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={styles.createAccount}
          onPress={() => props.navigation?.navigate('CreateUser')}
        >
          Create new Account
        </Text>
      </LinearGradient>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  card: {
    width: '95%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#FFB6E6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF84B7',
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
    borderRadius: 30,
    marginBottom: 12,
    padding: 2,
  },
  input: {
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#FF84B7',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#FFB6E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  createAccount: {
    marginTop: 16,
    fontSize: 14,
    color: '#FF84B7',
    textDecorationLine: 'underline',
  },
});
