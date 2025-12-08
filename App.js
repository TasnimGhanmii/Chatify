
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import Auth from './Screens/Auth'
import Home from './Screens/Home'
import CreateUser from './Screens/CreateUser'
import Chat from './Screens/Chat'
import GroupChat from './Screens/GroupChat'
import Account from './Screens/Home/Account'
const Stack=createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen name='Auth' component={Auth}></Stack.Screen>
            <Stack.Screen name='CreateUser' component={CreateUser}></Stack.Screen>
            <Stack.Screen name='Home' component={Home}></Stack.Screen>
            <Stack.Screen name='Chat' component={Chat}></Stack.Screen>
            <Stack.Screen name='Account' component={Account} /> 
            <Stack.Screen name='GroupChat' component={GroupChat} /> 
        </Stack.Navigator>
    </NavigationContainer>
  )
}