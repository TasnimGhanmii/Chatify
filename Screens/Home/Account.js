import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useEffect } from 'react';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import firebase, { supabase } from '../../config';
import { supabase } from '../../config';

const database=firebase.database();
const ref_all_account=database.ref().child("Accounts");
export default function Account(props) {
const currentId=props.route.params.currentId
const ref_account=ref_all_account.child(currentId);

  const [Nom, setNom] = useState("")
  const [Pseudo, setPseudo] = useState("Anonyme")
  const [Email, setEmail] = useState("")
  const [Numero, setNumero] = useState()
  const [UserImage, setUserImage] = useState()
  useEffect(() => {
  ref_account.once('value').then(snapshot => {
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
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setUserImage(result.assets[0].uri);
    }
  };

const uploadimageToSupabase=async(localUrl)=>{
   supabase.storage.from("images").upload(currentId+'.jpg')
}
  return (
    <ImageBackground
      source={require('../../assets/bg.jpg')}
      style={styles.container}>
      
      <View style={styles.card}>
        {/* Photo de profil */}
        <TouchableOpacity onPress={pickImage}>
             <Image

              source={UserImage ? {uri:UserImage} : require("../../assets/icon.png")}
              style={styles.profileImage}
          
            />
        </TouchableOpacity>
        

        <Text style={styles.title}>My Account</Text>

        {/* Champs modifiables */}
        <TextInput
        onChangeText={(text)=>
        {
          setNom(text)
        }
        }
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9b9b9b"
          value={Nom}
        />
         <TextInput
          onChangeText={(text)=>
        {
          setPseudo(text)
        }
        }
          style={styles.input}
          placeholder="Pseudo"
          placeholderTextColor="#9b9b9b"
          value={Pseudo}
        />

        <TextInput
         onChangeText={(text)=>
        {
          setEmail(text)
        }
        }
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9b9b9b"
          value={Email}
        />

        <TextInput
         onChangeText={(text)=>
        {
          setNumero(text)
        }
        }
          style={styles.input}
          placeholder="Numero"
          placeholderTextColor="#9b9b9b"
          value={Numero}
        />

        {/* Bouton Save */}
        <View style={styles.buttonWrapper}>
          <Button title="Save" color="#AEC16F" onPress={() =>
            {
              const urlImage=await uploadimageToSupabase(UserImage)
              ref_account.set(
                {
                  Id:currentId,
                  Nom,
                  Pseudo,
                  Email,
                  Numero,
                  Image:urlImage
                }
              )
              alert("account updated successfully")
            }
          } />

          <Button title='Supprimer' onPress={()=>{}}/>
        </View>
      </View>

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
    height: 500,
    width: "95%",
    borderRadius: 16,
    backgroundColor: "#f3f2d3c2",    // comme Auth
    alignItems: "center",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#AEC16F",        // couleur Auth
  },
  title: {
    fontSize: 26,
    fontWeight: "500",
    color: "#AEC16F",              // couleur Auth
    marginBottom: 16,
  },
  input: {
    height: 50,
    width: "95%",
    borderRadius: 30,              // comme Auth
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    borderWidth: 2,
    borderColor: "#AEC16F",        // comme Auth
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonWrapper: {
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
    width: 160,
  },
});

