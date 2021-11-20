import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { Image, StyleSheet, Text, View, Button as RNButton, TouchableOpacity, AppRegistry } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button, InputField, ErrorMessage } from '../components/Index';
import {Firebase, db} from '../config/firebase';

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import {doc, setDoc} from 'firebase/firestore'
const auth = Firebase.auth();

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [rightIcon, setRightIcon] = useState('eye');
  const [signupError, setSignupError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [createdAt, setCreatedAt] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [emailEntered, setEmailEntered] = useState(false);
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [firstNameEntered, setFirstNameEntered] = useState(false);
  const [lastNameEntered, setLastNameEntered] = useState(false);
  const [numberEntered, setNumberEntered] = useState(false);
  

  const handlePasswordVisibility = () => {
    if (rightIcon === 'eye') {
      setRightIcon('eye-off');
      setPasswordVisibility(!passwordVisibility);
    } else if (rightIcon === 'eye-off') {
      setRightIcon('eye');
      setPasswordVisibility(!passwordVisibility);
    }
  };

  const onHandleSignup = async () => {
    try {
      if (email !== '' && password !== '' && firstName !=='' && lastName !=='' && number!=='') {
        auth.createUserWithEmailAndPassword(email, password)
        .then(function(cred){
          Firebase.firestore().collection('users').doc(`${cred.user.uid}`).set({firstName: firstName, lastName: lastName, number: number, email: email}, {merge: true}).then(()=>{
          })
        });
      }
        //const data2 = await setDoc(doc(db, "users", `${data.user.uid}`))
        //const { user } = useContext(AuthenticatedUserContext);
      
      
    } catch (error) {
        if (error.message==="The email address is badly formatted."){
            setSignupError("The email address you've entered is invalid.");
        } else{
          setSignupError(error.message);
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
    if (firstName===''){
        setFirstNameEntered(true);
    } else{
        setFirstNameEntered(false);
    }
    if (lastName===''){
        setLastNameEntered(true);
    } else{
        setLastNameEntered(false);
    }
    if (number===''){
        setNumberEntered(true);
    } else{
        setNumberEntered(false);
    }

  };

  return (
    <View style={styles.container}>
      <StatusBar style='dark-content' />
      <TouchableOpacity onPress={()=>navigation.navigate("Splash")}>
        <MaterialCommunityIcons name="arrow-left" size={25} color={'#676868'}/>
      </TouchableOpacity>
      <Image style = {styles.logo} source={require("../assets/logo-blue.png")}/>
            <Text style={styles.title}></Text>

      <View style= {{flexDirection: 'row'}}>

      <InputField
        inputStyle={{
          fontSize: 14,
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          width: '49%',
          backgroundColor: "#e2e4e4",
          borderRadius: 25,
          paddingVertical: 10,
          marginVertical: 0,
          height: 40

        }}
        leftIcon="account"
        placeholder='Enter first name'
        keyboardType='default'
        textContentType='givenName'
        autoFocus={true}
        value={firstName}
        onChangeText={text => setFirstName(text)}
      />

      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          width: '49%',
          backgroundColor: "#e2e4e4",
          borderRadius: 25,
          paddingVertical: 10,
          marginVertical: 0,
          height: 40,
          marginLeft: '2%'
        }}

        leftIcon='account'
        placeholder='Enter last name'
        keyboardType='default'
        textContentType='familyName'
        autoFocus={true}
        value={lastName}
        onChangeText={text => setLastName(text)}
      />
    
      </View>

      <ErrorMessage error={' '} visible={true}/>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          flexDirection: 'row',
          backgroundColor: "#e2e4e4",
          borderRadius: 25,
          padding: 10,
          marginVertical: 0,
        }}
        leftIcon='email'
        placeholder='Enter email'
        autoCapitalize='none'
        keyboardType='email-address'
        textContentType='emailAddress'
        autoFocus={true}
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <ErrorMessage error={' '} visible={true} />

      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          flexDirection: 'row',
          backgroundColor: "#e2e4e4",
          borderRadius: 25,
          padding: 10,
          marginVertical: 0,
        }}
        leftIcon='phone'
        placeholder='Enter phone number'
        keyboardType='phone-pad'
        textContentType='telephoneNumber'
        autoFocus={true}
        value={number}
        onChangeText={text => setNumber(text)}
      />

     <ErrorMessage error={' '} visible={true} />

      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          flexDirection: 'row',
          backgroundColor: "#e2e4e4",
          borderRadius: 25,
          padding: 10,
          marginVertical: 0,
        }}
        leftIcon='lock'
        placeholder='Enter password'
        autoCapitalize='none'
        autoCorrect={false}
        secureTextEntry={passwordVisibility}
        textContentType='password'
        rightIcon={rightIcon}
        value={password}
        onChangeText={text => setPassword(text)}
        handlePasswordVisibility={handlePasswordVisibility}
      />
      <Button
        onPress={onHandleSignup}
       backgroundColor='#44bec6'
        title='Signup'
        tileColor='#fff'
        titleSize={15}
        containerStyle={{
          marginBottom: 24,
          marginTop: 12,
          borderRadius: 25
        }}
      />

    <View style={{alignSelf: 'center'}}>
    {signupError ? <ErrorMessage error={signupError} visible={true} /> : 
    <Text>{emailEntered || passwordEntered || firstNameEntered || lastNameEntered || numberEntered? <ErrorMessage error={"Please enter all required credentials."} visible={emailEntered}/> : <ErrorMessage error={" "} visible={true}/>}</Text>}
    </View>

       <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{position: 'absolute', bottom: 80, alignSelf: 'center'}}>
        <View >
          <Text style={{color: '#676868'}}>Login instead</Text>
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
    paddingHorizontal: 12
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
    alignSelf: 'center'
    
  }
});