import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import {Button, ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemModal from '../pages/ItemModal'
import {Firebase, db, functions} from '../config/firebase';
import {Stripe, CardField, StripeProvider,useConfirmPayment, useConfirmSetupIntent, createToken, createPaymentMethod} from '@stripe/stripe-react-native'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import PaymentMethods from '../pages/PaymentsList';


export default function Payments(){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const [errorBool, setErrorBool] = useState(false);
    const [cardholder, setCardholder] = useState();
    const [cardDetails, setCardDetails] = useState();
    const { confirmPayment } = useConfirmPayment();
    const {confirmSetupIntent} = useConfirmSetupIntent();
    // const createStripeCheckout = functions.httpsCallable('createStripeCheckout');
    // const createStripeCustomer = functions.httpsCallable('createStripeCustomer');
    const createStripeCheckout = functions.httpsCallable('createStripeCheckout');
    const createEphemeralKey = functions.httpsCallable('createEphemeralKey')
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthenticatedUserContext);
    const [status, setStatus] = useState(0);
    const [errorMessage, setErrorMessage] = useState('Card error, please try again.');

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


    //Create setup intent on backend and returns the client secret to use within confirmSetupIntent
    const getClientSecret = async () => {
        await setLoading(true);
        setErrorBool(false);
        

        const response = await fetch('https://us-central1-drinkly-user.cloudfunctions.net/createSetupIntent', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: authContext.userData.stripeId
            })
        })
        const responseJson = await response.json();
        const {setupIntent, error} = await confirmSetupIntent(responseJson.client_secret, {
            type: 'Card',
            billingDetails: {cardholder}
        })
        if (error){
            await setStatus(1);
            await setLoading(false);
            setErrorMessage('Card error, please try again.')
            setErrorBool(true);
        } else{
            await Firebase.firestore().collection('users').doc(authContext.user.uid).collection('payment_methods').doc(`${cardDetails.brand}-${cardDetails.expiryYear}-${cardDetails.last4}`).set({
                payment_id: setupIntent.paymentMethodId,
                brand: cardDetails.brand,
                expiryMonth: cardDetails.expiryMonth,
                expiryYear: cardDetails.expiryYear,
                postalCode: cardDetails.postalCode,
                lastFour: cardDetails.last4
         
            })
            const paymentsTemp = authContext.paymentMethods.map((x)=>x);
            paymentsTemp.unshift({
                payment_id: setupIntent.paymentMethodId,
                brand: cardDetails.brand,
                expiryMonth: cardDetails.expiryMonth,
                expiryYear: cardDetails.expiryYear,
                postalCode: cardDetails.postalCode,
                lastFour: cardDetails.last4
            })

            authContext.setPaymentMethods(paymentsTemp);

            await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
                default_payment_id: setupIntent.paymentMethodId,
                default_brand: cardDetails.brand,
                default_lastFour: cardDetails.last4
            }, {merge: true});

            const userDataTemp = authContext.userData;
            userDataTemp["default_payment_id"] = setupIntent.paymentMethodId;
            userDataTemp["default_brand"] = cardDetails.brand;
            userDataTemp["default_lastFour"]  = cardDetails.last4
            await authContext.setUserData(userDataTemp);
            await authContext.setDefaultPaymentId(setupIntent.paymentMethodId);
            await setLoading(false);
            await setStatus(2);
            await new Promise(res => setTimeout(res, 1000));
            navigation.pop(1);
           
        }
         
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
                    {errorBool ? <Text>{errorMessage}</Text> : <Text></Text>}
                    
                    <Button disabled = {loading} onPress={async()=>{
                        var cardExists = false;
                        
                        authContext.paymentMethods.map(async (paymentMethod, i)=>{
                                if (cardDetails.last4 === paymentMethod.lastFour){
                                    
                                    cardExists = true;
                                }
                        })
                            if (cardExists === false){
                                getClientSecret();
                            } else{
                                await setErrorMessage('You have already added this card.');
                                await setErrorBool(true);
                            }
                        
                    }} title="Add Card"/>

                    
                
                    
                </View>

                {loading === true ? <ActivityIndicator size='large' style={{alignSelf: 'center'}}/> : null}
                {status === 2 ? <MaterialCommunityIcons name="check-circle" size={25} color='green' style={{alignSelf: 'center'}}/> : null}
            
                </StripeProvider> 

                <Text style={{color: 'gray', width: '80%', marginTop: 20, alignSelf: 'center'}}>We're currently in testing mode. Please use Stripe's test cards to test this integration.</Text>
            </ScrollView>
            <TouchableOpacity
                disabled = {loading}
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