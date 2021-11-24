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
  const [passwordAgain, setPasswordAgain] = useState('')
  const [secondPasswordEntered, setSecondPasswordEntered] = useState(false);
  

  const handlePasswordVisibility = () => {
    if (rightIcon === 'eye') {
      setRightIcon('eye-off');
      setPasswordVisibility(!passwordVisibility);
    } else if (rightIcon === 'eye-off') {
      setRightIcon('eye');
      setPasswordVisibility(!passwordVisibility);
    }
  };

  const checkNumber = (number) => {
        const numberArray = number.split('');
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        if (numberArray.length!==12){
            return false;
        }

        numberArray.map((n, i)=>{
            if (n!=='-'){

            if (!numbers.includes(Number(n))){
                return false;
            }
            }

        })

        return true;
    }

    //EVENTUALLY WE MUST CHECK EMAIL VALIDITY AND SEND VALIDATION EMAIL.
    const checkEmail = (email) => {
        
    }

  const onHandleSignup = async () => {
    if (email !== '' && password !== '' && firstName !=='' && lastName !=='' && number!=='') {

      if (checkNumber(number) === false){
        setSignupError('Please enter a valid phone number.');
      } else if (password!==passwordAgain){
        setSignupError('Passwords do not match.')
      } else{
        await auth.createUserWithEmailAndPassword(email, password)
          .then(function(cred){
            Firebase.firestore().collection('users').doc(`${cred.user.uid}`).set({
              firstName: firstName, lastName: lastName, number: number, email: email, drinkly_bool: false,
              default_payment_id: null, default_brand: null, default_lastFour: null,
              drinkly_cash: 0
            }, {merge: true}).then(()=>{
          })
          
          })
          .catch((error)=>{
            if (error.message === 'The email address is badly formatted.'){
              setSignupError('Please enter a valid email address.');
            } else{
              setSignupError(error.message);
            }
            
        });
        //const data2 = await setDoc(doc(db, "users", `${data.user.uid}`))
        //const { user } = useContext(AuthenticatedUserContext);
      }
  }
    if (password===''){
        setPasswordEntered(true);
        setSignupError("Please enter all required credentials.");
    } else{
        setPasswordEntered(false);
    }
    if (email===''){
        setEmailEntered(true);

        setSignupError("Please enter all required credentials.");
    } else{
        setEmailEntered(false);
    }
    if (firstName===''){
        setFirstNameEntered(true);
        setSignupError("Please enter all required credentials.");
    } else{
        setFirstNameEntered(false);
    }
    if (lastName===''){
        setLastNameEntered(true);
        setSignupError("Please enter all required credentials.");
    } else{
        setLastNameEntered(false);
    }
    if (number===''){
        setNumberEntered(true);
        setSignupError("Please enter all required credentials.");
    } else{
        setNumberEntered(false);
    }

    if (passwordAgain === ''){
      setSecondPasswordEntered(true);
      setSignupError("Please enter password again.");
    } else{
      setSecondPasswordEntered(false);
    }

  };

  return (
    <View style={styles.container}>
      
      <TouchableOpacity onPress={()=>navigation.navigate("Splash")}>
        <MaterialCommunityIcons name="arrow-left" size={25} color={'#676868'}/>
      </TouchableOpacity>
      <Image style = {styles.logo} source={require("../assets/Logo.png")}/>

      <View style= {{flexDirection: 'row'}}>

      <View style={{width: '49%', float: 'left', marginTop: 10}}>
      <Text style={{fontWeight: 'bold', color: 'gray'}}>First name</Text>

      <InputField
        inputStyle={{
          fontSize: 14,
        }}
        containerStyle={{
          backgroundColor: '#fff',
          backgroundColor: "#e2e4e4",
          borderRadius: 5,
          paddingVertical: 10,
          marginVertical: 0,
          height: 40

        }}
        placeholder='Enter first name'
        keyboardType='default'
        textContentType='givenName'
        value={firstName}
        onChangeText={text => setFirstName(text)}
      />
      </View>

      <View style={{width: '49%', float: 'right', marginTop: 10, marginLeft: '2%',}}>
      <Text style={{fontWeight: 'bold', color: 'gray'}}>Last name</Text>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          backgroundColor: "#e2e4e4",
          borderRadius: 5,
          paddingVertical: 10,
          marginVertical: 0,
          height: 40,
          
          width: '100%'
        }}

        placeholder='Enter last name'
        keyboardType='default'
        textContentType='familyName'
        value={lastName}
        onChangeText={text => setLastName(text)}
      />
      </View>
    
      </View>

      <ErrorMessage error={' '} visible={true}/>
      <Text style={{fontWeight: 'bold', color: 'gray'}}>Email</Text>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          flexDirection: 'row',
          backgroundColor: "#e2e4e4",
          borderRadius: 5,
          padding: 10,
          marginVertical: 0,
        }}
        placeholder='Enter email'
        autoCapitalize='none'
        keyboardType='email-address'
        textContentType='emailAddress'
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <ErrorMessage error={' '} visible={true} />
      <Text style={{fontWeight: 'bold', color: 'gray'}}>Phone number</Text>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          flexDirection: 'row',
          backgroundColor: "#e2e4e4",
          borderRadius: 5,
          padding: 10,
          marginVertical: 0,
        }}
        placeholder='Enter phone number'
        keyboardType='phone-pad'
        textContentType='telephoneNumber'
        value={number}
        maxLength = {12}
        onChangeText={text => {
          if (text.length === 3){
            setNumber(text+'-');
          } else if (text.length === 7){
            setNumber(text+'-');
          } else{
            setNumber(text);

          }

        }
          
          }
      />

     <ErrorMessage error={' '} visible={true} />
      <Text style={{fontWeight: 'bold', color: 'gray'}}>Enter password</Text>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          flexDirection: 'row',
          backgroundColor: "#e2e4e4",
          borderRadius: 5,
          padding: 10,
          marginVertical: 0,
        }}
        placeholder='Enter password'
        autoCapitalize='none'
        autoCorrect={false}
        secureTextEntry={true}
        textContentType='password'
        value={password}
        onChangeText={text => setPassword(text)}
        handlePasswordVisibility={handlePasswordVisibility}
      />
      <ErrorMessage error={' '} visible={true} />
      <Text style={{fontWeight: 'bold', color: 'gray'}}>Enter password again</Text>
      <InputField
        inputStyle={{
          fontSize: 14
        }}
        containerStyle={{
          backgroundColor: '#fff',
          float: 'left',
          flexDirection: 'row',
          backgroundColor: "#e2e4e4",
          borderRadius: 5,
          padding: 10,
          marginVertical: 0,
        }}
        placeholder='Enter password again'
        autoCapitalize='none'
        autoCorrect={false}
        secureTextEntry={true}
        textContentType='password'
        value={passwordAgain}
        onChangeText={text => setPasswordAgain(text)}
        handlePasswordVisibility={handlePasswordVisibility}
      />

      <Button
        onPress={onHandleSignup}
       backgroundColor='#44bec6'
        title='Signup'
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
    {signupError!== '' ? <ErrorMessage error={signupError} visible={true} /> : 
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
    alignSelf: 'center',
    marginTop: -10
    
  }
});