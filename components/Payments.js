import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import {Button, ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemModal from '../pages/ItemModal'
import {Firebase, db, functions} from '../config/firebase';
import {Stripe, CardField, StripeProvider,useConfirmPayment, useConfirmSetupIntent} from '@stripe/stripe-react-native'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';


export default function Payments(){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const errorBool = false;
    const [cardholder, setCardholder] = useState();
    const [cardDetails, setCardDetails] = useState();
    const { confirmPayment, loading } = useConfirmPayment();
    const {confirmSetupIntent} = useConfirmSetupIntent();
    // const createStripeCheckout = functions.httpsCallable('createStripeCheckout');
    // const createStripeCustomer = functions.httpsCallable('createStripeCustomer');
    const createStripeCheckout = functions.httpsCallable('createStripeCheckout');
    const { user } = useContext(AuthenticatedUserContext);

    // const paymentRequest= async ()=>{

    //     const token = await stripe.paymentRequestWithCardForm({
    //     // Only iOS support this options
    //     smsAutofillDisabled: true,
    //     requiredBillingAddressFields: 'full',
    //     prefilledInformation: {
    //         billingAddress: {
    //         name: 'Enappd Store',
    //         line1: 'Canary Place',
    //         line2: '3',
    //         city: 'Macon',
    //         state: '',
    //         country: 'Estonia',
    //         postalCode: '31217',
    //         email: 'admin@enappd.com',
    //         },
    //     },
    //     })

    // }


    // exports.createCustomer = functions.https.onCall((data, context)=>{
    //   const stripe = require("stripe")(functions.config().stripe.secret_key);
    //   const customer = stripe.customers.create({
    //     email: "annieyang1993@hotmail.com",
    //     displayName: "annie",
    //     phone: "646-209-3360",
    //   });
    //   return customer;
    // });

    // exports.createStripeCustomer = functions.auth.user()
    // .onCreate(async (user, response) => {
    //   const customer = await stripe.customers.create({email: user.email});
    //   const intent = await stripe.setupIntents.create({
    //     customer: customer.id,
    //   });
    //   await admin.firestore().collection("stripe_customers").doc(user.uid).set({
    //     customer_id: customer.id,
    //     setup_secret: intent.client_secret,
    //   });
    //   response.send({"data": "hello"});
    // });

    const handleSubmit=async(e)=>{
        const response = await createStripeCheckout();
        console.log(response);
    }


    return(
        <View style={{backgroundColor: 'white'}}>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: Dimensions.get("screen").height, backgroundColor: 'white', paddingTop: 80}}>
                
                <StripeProvider merchantIdentifier="merchant.identifier"
                    publishableKey={"pk_test_51JZinFLzDwIJCChhuq8DoRCrStqSktqj22guQPw1NaReIUa97QsONeJrOCdiKsxVq7nSapVfsXYFwxdzueG9PRgX00Ru6vfnBu"}>
                    <View style={styles.container}>
                    <TextInput
                    autoCapitalize='none'
                    placeholder='Cardholder Name'
                    keyboardType='default'
                    onChange={value=>setCardholder(value.nativeEvent.text)}
                    style={styles.input}/>
                <CardField
                    postalCodeEnabled={true}
                    placeholder={{number: 'XXXX XXXX XXXX XXXX'}}
                    cardStyle = {styles.card}
                    style={styles.cardContainer}
                    onCardChange={cardDetails =>{
                        
                        setCardDetails(cardDetails)
                    }}
                    />
                    {errorBool ? <Text>Card error, please try again.</Text> : <Text></Text>}
                    
                    <Button onPress={handleSubmit} title="Add Card"/>
                
                    
                </View>
            
                </StripeProvider> 
            </ScrollView>
            <TouchableOpacity
                style={{backgroundColor: 'white',
                borderRadius: 10,
                width: 20,
                height: 20,
                position: 'absolute',
                marginTop: 50,
                marginHorizontal: 20,
                
                zIndex: 50,
                }}
                onPress={() => {
                    navigation.pop(1)
                }}>
                <MaterialCommunityIcons name="arrow-left" size={22}/>
            </TouchableOpacity> 
        </View>
    )
}

const styles=StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        width: '95%',
        alignSelf: 'center'

    },
    text: {
        textAlign: 'left'
    },
    input: {
        backgroundColor: '#efefefef',
        width: '95%',
        margin: '2.5%',
        height: 30,
        borderRadius: 5,
        padding: 5
        
    },

    card: {
        color: 'black'
    },

    cardContainer: {
        backgroundColor: '#efefefef',
        width: '95%',
        margin: '2.5%',
        height: 30,
        borderRadius: 5,
        padding: 5
    }
    })