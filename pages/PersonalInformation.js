import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, ScrollView, TouchableOpacity, StyleSheet, Text, View, Dimensions} from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import InputField from '../components/InputField'

export default function PersonalInformation({navigation}){
    const authContext = useContext(AuthContext);
    const [firstName, setFirstName] = useState(authContext.userData.firstName);
    const [lastName, setLastName] = useState(authContext.userData.lastName);
    const [number, setNumber] = useState(authContext.userData.number);
    const [email, setEmail] = useState(authContext.userData.email);
    const auth = Firebase.auth();
    const [passwordModule, setPasswordModule] = useState(false);
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submittedState, setSubmittedState] = useState(0);

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

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{height: '100%', width: '100%'}}>

                <View style={{flexDirection: 'row', marginTop: 20, width: '100%', marginTop: 50}}>

                    <View style={{width: '44%', marginLeft: '4%'}}>
                    <Text style={{fontWeight: 'bold', marginVertical: 5}}>First Name</Text>
                      <InputField
                            inputStyle={{
                            fontSize: 14,
                            }}
                            containerStyle={{
                            backgroundColor: '#fff',
                            float: 'left',
                            width: '100%',
                            backgroundColor: "#eaeded",
                            borderRadius: 5,
                            paddingVertical: 10,
                            
                            height: 40,

                            }}
                            placeholder='Enter first name'
                            keyboardType='default'
                            textContentType='givenName'
                            value={firstName}
                            onChangeText={text => setFirstName(text)}
                        />
                    </View>

                    <View style={{width: '44%', marginLeft: '4%'}}>
                    <Text style={{fontWeight: 'bold', marginVertical: 5}}>Last Name</Text>
                      <InputField
                            inputStyle={{
                            fontSize: 14,
                            }}
                            containerStyle={{
                            backgroundColor: '#fff',
                            float: 'left',
                            width: '100%',
                            backgroundColor: "#eaeded",
                            borderRadius: 5,
                            paddingVertical: 10,
                            
                            height: 40,

                            }}
                            placeholder='Enter first name'
                            keyboardType='default'
                            textContentType='givenName'
                            value={lastName}
                            onChangeText={text => setLastName(text)}
                        />
                    </View>
                </View>

                 <Text style={{margin: 5, fontWeight: 'bold', marginTop: 30, width: '92%', alignSelf: 'center'}}>Phone number</Text>
                <InputField
                    inputStyle={{
                    fontSize: 14,
                    }}
                    containerStyle={{
                    backgroundColor: '#fff',
                    float: 'left',
                    width: '92%',
                    alignSelf: 'center',
                    backgroundColor: "#eaeded",
                    borderRadius: 5,
                    paddingVertical: 10,
                    height: 40,

                    }}
                    placeholder='Enter phone number'
                    keyboardType='phone-pad'
                    textContentType='givenName'
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
                        
                    }}
                />

                <Text style={{margin: 5, fontWeight: 'bold', marginTop: 30, width: '92%', alignSelf: 'center'}}>Email</Text>
                <InputField
                    inputStyle={{
                    fontSize: 14,
                    }}
                    containerStyle={{
                    backgroundColor: '#fff',
                    float: 'left',
                    width: '92%',
                    alignSelf: 'center',
                    backgroundColor: "#eaeded",
                    borderRadius: 5,
                    paddingVertical: 10,
                    height: 40,

                    }}
                    placeholder='Enter email'
                    keyboardType='default'
                    textContentType='givenName'
                    value={email}
                    onChangeText={text => setEmail(text)}
                />

                <TouchableOpacity style={{paddingVertical: 10, borderRadius: 5, backgroundColor: '#44bec6', width: 80, marginTop: 250, marginBottom: 10, alignSelf: 'center'}} onPress={async ()=>{
                    if (checkNumber(number)===false){
                        setErrorMessage('Please enter a valid phone number.')
                    } else{
                        setErrorMessage('')
                        if (email!==authContext.userData.email){
                            auth.currentUser.updateEmail(email).then(async ()=>{
                                await Firebase.firestore()
                                    .collection('users')
                                    .doc(`${authContext.user.uid}`)
                                    .set({
                                        email: email,
                                        firstName: firstName,
                                        lastName: lastName,
                                        number: number
                                    }, {merge: true})
                                setSubmittedState(1);
                            }).catch((error)=>{
                                //An error occurred
                            setPasswordModule(true);
                            })

                        } else{
                            Firebase.firestore()
                                    .collection('users')
                                    .doc(`${authContext.user.uid}`)
                                    .set({
                                        firstName: firstName,
                                        lastName: lastName,
                                        number: number
                                    }, {merge: true})
                            .then(async()=>{
                                setSubmittedState(1);
                            })
                        }
                        

                    }
                    
                }}>
                    <Text style={{alignSelf: 'center', color: 'white', fontWeight: '500'}}>Submit</Text>
                </TouchableOpacity>
            
                <Text>
                {submittedState === 1 ? <Text style={{alignSelf: 'center', textAlign: 'center', marginTop: 20}}><Text style={{alignSelf: 'center', color: 'green'}}>Saved!</Text> <MaterialCommunityIcons name="check-circle" color={'green'} size={20}/></Text>: <Text style={{alignSelf: 'center', marginTop: 20, textAlign: 'center', color: 'red'}}>{errorMessage}</Text>}
                </Text>
            </ScrollView>

            <Modal visible={passwordModule} backgroundColor='transparent' transparent={true} style={{zIndex: 500, marginTop: 600}}>
            <View style={{height: 180, width: '90%', backgroundColor: 'white', position: 'absolute', top: '25%', left: '5%', borderRadius: 15, marginTop: 150, shadowColor: 'gray', shadowOffset: {width: 3, height: 3}, shadowRadius: 5, shadowOpacity: 0.6,}}>
                <View style={{backgroundColor: 'white',
                    borderRadius: 10,
                    position: 'absolute',
                    margin: 10,
                    marginHorizontal: 0,
                    zIndex: 50,
                    marginTop: 10,
                    width: '90%',
                    alignSelf: 'center'
                    }}> 
                    
                    <View style={{flexDirection: 'row', width: '90%', alignItems: 'center', alignSelf: 'center'}}>

                    <InputField
                        inputStyle={{
                        fontSize: 14
                        }}
                        containerStyle={{
                        backgroundColor: '#fff',
                        alignSelf: 'center',
                        width: '100%',
                        alignSelf: 'center',
                        backgroundColor: "#eaeded",
                        borderRadius: 5,
                        paddingVertical: 10,
                        height: 40,
                        marginTop: 40
                        }}
                        placeholder='Enter password'
                        autoCapitalize='none'
                        autoCorrect={false}
                        secureTextEntry={true}
                        textContentType='password'
                        value={password}
                        onChangeText={text => setPassword(text)}
                    />
                    </View>

                    <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <TouchableOpacity style={{marginTop: 10, backgroundColor: '#44bec6', padding: 5, width: '35%', borderRadius: 5, height: 30, margin: 5}} onPress={async ()=>{
                        await auth.signInWithEmailAndPassword(authContext.userData.email, password).then(async()=>{
                            auth.currentUser.updateEmail(email).then(async ()=>{
                            await Firebase.firestore()
                                .collection('users')
                                .doc(`${authContext.user.uid}`)
                                .set({
                                    email: email,
                                    firstName: firstName,
                                    lastName: lastName,
                                    number: number
                                }, {merge: true})
                            }).catch((error)=>{
                               console.log(error);
                            })
                            setPassword('')

                        });
                        setPasswordModule(false);
                        setSubmittedState(1);
                    }}>
                        <Text style={{color: 'white', fontWeight: '500', alignSelf: 'center'}}>Enter</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={{marginTop: 10, backgroundColor: '#44bec6', padding: 5, width: '35%', borderRadius: 5, height: 30, margin: 5}} onPress={()=>selectImage(photoIndex)}>
                        <Text style={{color: 'white', fontWeight: '500', alignSelf: 'center'}}>Upload to store</Text>
                    </TouchableOpacity> */}

                    </View>


                
                <TouchableOpacity
                    style={{backgroundColor: 'white',
                    borderRadius: 10,
                    position: 'absolute',
                    margin: 10,
                    marginHorizontal: 0,
                    zIndex: 50,
                    marginTop: 5
                    }}
                    onPress={() => {
                        setPassword('')
                        setPasswordModule(false)
                    }}>
                    <Text style={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    fontSize: 15, padding: 5}}><MaterialCommunityIcons name="close" size={20} color='gray'/></Text>
                </TouchableOpacity>
            </View>
            </View>
            </Modal>

            <View style={{flexDirection: 'row', backgroundColor: 'white',
                borderRadius: 10,
                height: 20,
                position: 'absolute',
                marginTop: 0,
                marginHorizontal: 10,
                
                zIndex: 50,}}>
            <TouchableOpacity
                style={{
                }}
                onPress={() => {
                    navigation.pop(1)
                }}>
                <MaterialCommunityIcons name="arrow-left" size={22}/>
            </TouchableOpacity> 
             <Text style={{fontWeight: 'bold', fontSize: 18, marginLeft: 10}}>Personal Information</Text>
            
            </View>
            </View>
        </View>    )

}

const styles = StyleSheet.create({

    container: {
    borderRadius: 25,
    width: '95%',
    marginVertical: 10,
    alignSelf: 'center',
    marginTop: 50,
    zIndex: 2,
  }
})