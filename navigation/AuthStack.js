import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Dimensions, TouchableHighlight, Button, TextInput, Screen, Image, Platform} from 'react-native'


const Stack = createStackNavigator();

const SplashScreen = ({navigation}) => (
    <SafeAreaView style={styles.screen}>
        <Image style = {styles.logo} source={require("../assets/Logo.png")}/>
        <Image style = {styles.image} source={require("../assets/home-page-icon.png")}/>
            <TouchableHighlight underlayColor="#119aa3" style={styles.register} title="register"
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
      width: Dimensions.get("screen").width*0.5,
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
    backgroundColor: "#d2d5d5",
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
    fontWeight: 'bold',
    shadowColor: 'black', 
    shadowOffset: {width: 2, height: 2}, 
    shadowRadius: 3, 
    shadowOpacity: 0.6
    
  },

  register: {
    position: 'absolute',
    backgroundColor: "#44bec6",
    borderRadius: 20,
    flexDirection: "row",
    width: '95%',
    padding: 15,
    bottom: 100,
    textDecorationColor: 'white',
    fontWeight: 'bold',
    justifyContent: 'center',  
    shadowColor: 'black', 
    shadowOffset: {width: 2, height: 2}, 
    shadowRadius: 3, 
    shadowOpacity: 0.6
  },

  loginText: {
      textDecorationColor: 'white',
      fontWeight: 'bold',
      fontSize: 15
      
  },

  registerText: {
      color: 'white',
      textDecorationColor: 'white',
      fontWeight: 'bold',
      fontSize: 15
      
  },

  loginText: {
      color: 'black',
      textDecorationColor: 'white',
      fontWeight: 'bold',
      fontSize: 15
      

  },

  logo: {
    width: "50%",
    height: "8%",
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10
    
  }
  
})