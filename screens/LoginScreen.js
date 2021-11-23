import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { Image, StyleSheet, Text, View, Button as RNButton, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button, InputField, ErrorMessage } from '../components/Index';
import {Firebase, db} from '../config/firebase';
import 'firebase/firestore'
const auth = Firebase.auth();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState('eye');
  const [loginError, setLoginError] = useState('');
  const [emailEntered, setEmailEntered] = useState(false);
  const [passwordEntered, setPasswordEntered] = useState(false);

  const handlePasswordVisibility = () => {
    if (rightIcon === 'eye') {
      setRightIcon('eye-off');
      setPasswordVisibility(!passwordVisibility);
    } else if (rightIcon === 'eye-off') {
      setRightIcon('eye');
      setPasswordVisibility(!passwordVisibility);
    }
  };

  const onLogin = async () => {
    try {
      if (email !== '' && password !== '') {
        await auth.signInWithEmailAndPassword(email, password);
      }
    } catch (error) {
        if (error.message==="The email address is badly formatted."){
            setLoginError("The email address you've entered is invalid.");
        } else{
            setLoginError("Invalid email/password combination.")
        }
      
    }
    if (password===''){
        setPasswordEntered(true);
    } else{
        setPasswordEntered(false);
    }
    if (email===''){
        setEmailEntered(true);
    } else{
        setEmailEntered(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style='dark-content' />
      <TouchableOpacity onPress={()=>navigation.navigate("Splash")}>
        <MaterialCommunityIcons name="arrow-left" size={25} color={'#676868'}/>
      </TouchableOpacity>

     <Image style = {styles.logo} source={require("../assets/Logo.png")}/>
    <Text style={{fontWeight: 'bold', color: 'gray', marginTop: 10}}>Email</Text>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: "#e2e4e4",
            borderRadius: 5,
            flexDirection: "row",
            width: '100%',
            padding: 10,
            marginVertical: 0,
            alignSelf: 'center',
            marginTop: 0,

        }}
        placeholder='Enter email'
        autoCapitalize='none'
        keyboardType='email-address'
        textContentType='emailAddress'
        value={email}
        onChangeText={text => {setEmail(text) 
        }}
        secureTextEntry={false}
      />

        <ErrorMessage error={' '} visible={true}/>
        <Text style={{fontWeight: 'bold', color: 'gray'}}>Enter password</Text>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: "#e2e4e4",
            borderRadius: 5,
            flexDirection: "row",
            width: '100%',
            padding: 10,
            marginVertical: 0,
            alignSelf: 'center',
            
        }}
        placeholder='Enter password'
        autoCapitalize='none'
        autoCorrect={false}
        secureTextEntry={true}
        textContentType='password'
        value={password}
        onChangeText={text => {setPassword(text)
         }}
        handlePasswordVisibility={handlePasswordVisibility}
      />

      <Button
        onPress={onLogin}
        backgroundColor='#44bec6'
        title='Login'
        tileColor='#fff'
        titleSize={15}
        containerStyle={{
          marginBottom: 20,
          marginTop: 30,
          borderRadius: 25,
          shadowColor: 'black', 
          shadowOffset: {width: 2, height: 2}, 
          shadowRadius: 3, 
          shadowOpacity: 0.6
        }}
      /> 
    <View style={{alignSelf: 'center'}}>
    {loginError ? <ErrorMessage error={loginError} visible={true} /> : 
    <Text>{emailEntered || passwordEntered? <ErrorMessage error={"Please enter a valid email address and password."} visible={emailEntered}/> : <ErrorMessage error={" "} visible={true}/>}</Text>}
    </View>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{position: 'absolute', bottom: 80, alignSelf: 'center'}}>
        <View >
          <Text style={{color: '#676868'}}>Signup instead</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Splash')} style={{position: 'absolute', bottom: 50, alignSelf: 'center'}}>
        <View >
          <Text style={{color: '#676868'}}>Back to Welcome</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 12,
    height: Dimensions.get("screen").height,

  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    alignSelf: 'center',
    paddingBottom: 24
  },
    logo: {
    width: "40%",
    height: "8%",
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -10
    
  }
});