import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import List from "./Home/List";
import Account from "./Home/Account";
import Groups from "./Home/Groups";
import { Animated, Platform } from "react-native";
import { useRef } from "react";

const Tab = createBottomTabNavigator();

export default function Home(props) {
  const currentId = props.route?.params?.currentId ?? null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "List") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Groups") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Account") {
              iconName = focused ? "person" : "person-outline";
            }

            const scaleAnim = useRef(new Animated.Value(1)).current;
            Animated.spring(scaleAnim, {
              toValue: focused ? 1.2 : 1,
              useNativeDriver: true,
              friction: 5,
            }).start();

            return (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name={iconName} size={focused ? size + 4 : size} color={color} />
              </Animated.View>
            );
          },

          tabBarActiveTintColor: "#FF69B4",
          tabBarInactiveTintColor: "#C6A4B5",

          tabBarStyle: {
            backgroundColor: "#FFE4EF",
            height: 70,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            paddingTop: 10,
            borderTopColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            borderRadius: 25,
          },

          headerShown: false,
        };
      }}
    >
      <Tab.Screen
        initialParams={{ currentId }}
        name="List"
        component={List}
      />

      <Tab.Screen
        name="Groups"
        component={Groups}
        initialParams={{ currentId }}
      />

      <Tab.Screen
        initialParams={{ currentId }}
        name="Account"
        component={Account}
      />
    </Tab.Navigator>
  );
}
