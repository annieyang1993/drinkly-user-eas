import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Dimensions, TouchableHighlight, Button, TextInput, Screen, Image, Platform} from 'react-native'


const Stack = createStackNavigator();

const SplashScreen = ({navigation}) => (
    <SafeAreaView style={styles.screen}>
        <Image style = {styles.logo} source={require("../assets/logo-blue.png")}/>
        <Image style = {styles.image} source={require("../assets/Splash1.png")}/>
            <TouchableHighlight underlayColor="#7fd9df" style={styles.register} title="register"
            onPress={()=>navigation.navigate("Signup")}>
                <Text style={styles.registerText}>Register</Text></TouchableHighlight>
        
            <TouchableHighlight underlayColor="#c4c9c9" style={styles.login} title="login" onPress={()=>navigation.navigate("Login")}>
                <Text style={styles.loginText}>Login</Text></TouchableHighlight>
      </SafeAreaView>
   
)

export default function AuthStack() {
  return (
    
    <Stack.Navigator >

      <Stack.Screen name='Splash' options={{title:"", headerShown: false}} component={SplashScreen}/>
      <Stack.Screen name='Login' options={{title:"", headerShown: false}} component={LoginScreen} />
      <Stack.Screen name='Signup' options={{title:"", headerShown: false}} component={SignupScreen} />
    </Stack.Navigator>
    
  );
}
  
  const styles = StyleSheet.create({
  screen: {
    paddingTop: 50,
    //backgroundColor: "brown",
    textAlignVertical: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: "100%"
  },

  image: {
      width: Dimensions.get("screen").width*0.85,
      height: Dimensions.get("screen").width*0.85,
      resizeMode: 'contain',
      flexDirection: 'column',
      alignSelf: 'center',
      opacity: .3,
      borderColor: "gray",
      marginVertical: "20%",
      position: 'absolute',
      top: "15%",
      borderRadius: 250

  },

  login: {
    position: 'absolute',
    backgroundColor: "#a1a8a8",
    borderRadius: 25,
    flexDirection: "row",
    width: '95%',
    padding: 15,
    marginVertical: 5,
    bottom: 30,
    color: "white",
    textDecorationColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
    
  },

  register: {
    position: 'absolute',
    backgroundColor: "#44bec6",
    borderRadius: 25,
    flexDirection: "row",
    width: '95%',
    padding: 15,
    bottom: 90,
    textDecorationColor: 'white',
    fontWeight: 'bold',
    justifyContent: 'center',  
  },

  loginText: {
      textDecorationColor: 'white',
      fontWeight: 'bold',
      
  },

  registerText: {
      color: 'white',
      textDecorationColor: 'white',
      fontWeight: 'bold',
      
  },

  loginText: {
      color: 'black',
      textDecorationColor: 'white',
      fontWeight: 'bold',
      
  },

  logo: {
    width: "40%",
    height: "8%",
    resizeMode: 'contain',
    alignSelf: 'center'
    
  }
  
})