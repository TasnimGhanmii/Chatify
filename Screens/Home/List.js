import { View, Text, ImageBackground, FlatList, TouchableOpacity } from 'react-native'
import { StyleSheet } from 'react-native'
import { TextInput } from 'react-native'
import { useState, useEffect } from 'react'
import { Image } from 'react-native'
import React from 'react'
import firebase from '../../config';
import { Ionicons } from "@expo/vector-icons";
import Chat from '../Chat'

const database = firebase.database();
const ref_all_account = database.ref().child("Accounts");

export default function List(props) {
  const [data, setdata] = useState([])
  const currentId=props.route.params.currentId
  useEffect(() => {
    ref_all_account.on('value', (snapshot) => {
      var d = []
      snapshot.forEach((oneaccount) => {
        d.push(oneaccount.val())
      })
      setdata(d)
    })
  
    return () => {
      ref_all_account.off()
    }
  }, [])
  //CALL sms chat
  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.container}
    >
      <Text style={styles.title}>Liste des comptes</Text>

      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.avatar}
                
              />
              <View>
                <Text style={styles.name}>{item.Nom}</Text>
                <Text style={styles.pseudo}>{item.Pseudo}</Text>
                <Text style={styles.numero}>{item.Numero}</Text>
                <View style={styles.iconRow}
                >
                  <TouchableOpacity onPress={()=>{
                  props.navigation.navigate("Chat",{secondId:item.Id,
                                                    currentId:currentId
                  })
                }} style={styles.isiconButton}>
                
                  <Ionicons name="chatbubbles" size={22} color="#AEC16F"/>
                 
                </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{
                  props.navigation.navigate("Chat")
                }} style={styles.isiconButton}>
                
                 <Ionicons name="chatbox" size={22} color="#AEC16F" />
                 
                </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{
                  props.navigation.navigate("Chat")
                }} style={styles.isiconButton}>
                
                 <Ionicons name="call" size={22} color="#AEC16F" />
                 
                </TouchableOpacity>
                
                </View>
                 
                
              </View>
            </View>
          )
        }}
      />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center"
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f2d3ff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
  },

  avatar: {
    width: 50,
    height: 50,
    marginRight: 15
  },

  name: {
    fontSize: 18,
    fontWeight: "bold"
  },

  pseudo: {
    fontSize: 16,
    color: "gray"
  },

  numero: {
    fontSize: 15,
    color: "#555"
  },
  iconRow: {
    flexDirection: "row",          // horizontal
    justifyContent: "center",
    alignItems: "center",
    gap: 20,  
    
  },
})