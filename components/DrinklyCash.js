import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import {Button, ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemModal from '../pages/ItemModal'
import {Firebase, db, functions} from '../config/firebase';
import {Stripe, CardField, StripeProvider,useConfirmPayment, useConfirmSetupIntent, createToken, createPaymentMethod} from '@stripe/stripe-react-native'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import { InputField, ErrorMessage } from '../components/Index';

export default function DrinklyCash({route}){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const errorBool = false;
    const [cardholder, setCardholder] = useState();
    const [cardDetails, setCardDetails] = useState();
    const { confirmPayment} = useConfirmPayment();
    const {confirmSetupIntent} = useConfirmSetupIntent();
    // const createStripeCheckout = functions.httpsCallable('createStripeCheckout');
    // const createStripeCustomer = functions.httpsCallable('createStripeCustomer');
    const createStripeCheckout = functions.httpsCallable('createStripeCheckout');
    const createEphemeralKey = functions.httpsCallable('createEphemeralKey')
    const { user } = useContext(AuthenticatedUserContext);
    const amounts = [50, 70, 90, 110];
    const [amountIndex, setAmountIndex] = useState(1);
    const [amount, setAmount] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentModal, setPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addingCash, setAddingCash] = useState(false);

    const addCash = async() =>{
        await setAddingCash(true);
        if (amountIndex === -1){
            if (isNaN(amount) || amount<amounts[0]){
                setErrorMessage(`Please enter an amount greater than $${amounts[0]}.`);
                return
            } else if (amount>1000){
                setErrorMessage(`Please enter an amount less than $1000.`);
                return
            }
            else{
                setErrorMessage(``);
            }
        }
            
        if (authContext.userData.default_payment_id === undefined || authContext.userData.default_payment_id === null){
            setPaymentModal(true);
            return
        } else{
            createCharge();
            const drinklyCashTemp = authContext.userData.drinkly_cash === null || authContext.userData.drinkly_cash === undefined ? 0 : Number(authContext.userData.drinkly_cash);
            const addition = amountIndex === -1 ? Number(amount) : Number(amounts[amountIndex]);
            const sum = drinklyCashTemp + addition;
            await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
                drinkly_cash: sum
            }, {merge: true});
            const userDataTemp = authContext.userData;
            userDataTemp["drinkly_cash"] = sum;
            authContext.setDrinklyCashAmount(sum);
            await authContext.setUserData(userDataTemp);
        }
        await setAddingCash(false);
        navigation.pop(1);
    }

    const makeDefault = async(card) =>{
        await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
                default_payment_id: card.payment_id,
                default_brand: card.brand,
                default_lastFour: card.lastFour
            }, {merge: true});

        const userDataTemp = authContext.userData;
        userDataTemp["default_payment_id"] = card.payment_id;
        userDataTemp["default_brand"] = card.brand;
        userDataTemp["default_lastFour"]  = card.lastFour;
        await authContext.setUserData(userDataTemp);
        await authContext.setDefaultPaymentId(card.payment_id);

    }

    const createCharge = async() => {
        const response = await fetch('http://localhost:5000/drinkly-user/us-central1/createCharge', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: authContext.userData.stripeId,
                amount: amountIndex === -1 ? Number(amount) : amounts[amountIndex],
                payment_id: authContext.userData.default_payment_id
            })
        })
        const responseJson = await response.json();
    }




    const getClientSecret = async () => {
        await setLoading(true);
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
            console.log(error);
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
            await setCardDetails();
            await setLoading(false);
            await setPaymentModal(false);
           
        }
         
    }

    return(
        <View style={{backgroundColor: 'white'}}>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: Dimensions.get("screen").height, backgroundColor: 'white', paddingTop: 80}}>
                <Text style={{alignSelf: 'center', marginBottom: 50, color: '#a7a9a9', fontSize: 40, fontWeight: '400', marginTop: 20, width: '95%', textAlign: 'center', paddingVertical: 20, borderRadius: 15}}>Balance: ${authContext.userData.drinkly_cash === undefined ? 0 : authContext.userData.drinkly_cash}</Text>

                {amounts.map((amount, i)=>{
                    return (
                    <View  key={i} style={{width: '80%', borderBottomWidth: 1, alignSelf: 'center', borderBottomColor: 'lightgray'}}>
                    <TouchableOpacity style={{padding: 15, flexDirection: 'row'}} onPress={()=>{setAmountIndex(i)}}>
                        <Text style={{color: '#747575'}}>Add ${amount}</Text>
                        {amountIndex === i ? <MaterialCommunityIcons name="check" color='green' size={25} style={{position: 'absolute', right: 0, marginTop: 13}}/> : null}
                    </TouchableOpacity>
                    </View>)
                })}

                <View  style={{width: '80%', borderBottomWidth: 1, alignSelf: 'center', borderBottomColor: 'lightgray'}}>
                    <TouchableOpacity style={{padding: 10, flexDirection: 'row'}} onPress={()=>setAmountIndex(-1)}>
                        <InputField
                            inputStyle={{
                            fontSize: 14
                            }}
                            containerStyle={{
                            backgroundColor: '#fff',
                            float: 'left',
                            width: '70%',
                            borderRadius: 5,
                            backgroundColor: '#ebf0f0',

                            }}
                            placeholder='Enter amount'
                            keyboardType='number-pad'
                            autoFocus={false}
                            value={amount}
                            onChangeText={text => {
                            setAmount(text);
                            setAmountIndex(-1)}}
                        />
                        {amountIndex === -1 ? <MaterialCommunityIcons name="check" color='green' size={25} style={{position: 'absolute', right: 0, marginTop: 13}}/> : null}
                    </TouchableOpacity>
                </View>

                <Text style={{alignSelf: 'center', color: 'red', marginTop: 20}}>{errorMessage}</Text>

                <TouchableOpacity style={{marginTop: 200, width: '80%', alignSelf: 'center', paddingVertical: 11, paddingHorizontal: 30, backgroundColor: '#119aa3', borderRadius: 20, textAlign: 'center'}} 
                        onPress={()=>{
                            addCash();
                            // if (authContext.userData["default_card"]===undefined){
                            //     setPaymentModal(true)
                            // } else{
                            // }
                        }}>
                    <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 16}}>Add {amountIndex !== -1 ? `$${amounts[amountIndex]}` : (amount==='' || isNaN(amount) || amount === undefined ? '' : `$${amount}`)} Drinkly Cash</Text>
            </TouchableOpacity> 
                
            </ScrollView>

            
            <Modal visible={paymentModal} transparent={true} animationType='slide'>
                <View style={{padding: 20, width: '100%', backgroundColor: 'white', position: 'absolute', bottom: '0%', height: 250, alignSelf: 'center', borderRadius: 15, shadowColor: 'gray', shadowOffset: {width: 2, height: -2}, shadowRadius: 2, shadowOpacity: 0.4}}>
                
                <View><Text style={{alignSelf: 'center', fontSize: 15, fontWeight: '500', marginBottom: 20}}>Please add a default payment method.</Text>

                </View>

                <ScrollView>
                {authContext.paymentMethods.map((payment, i)=>{
                        return (
                            <View key={i} style={{width: '100%', borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                                <TouchableOpacity style={{width: '100%', flexDirection: 'row', padding: 5, paddingVertical: 10}} onPress={async ()=>{makeDefault(payment).then(()=>{addCash(); setPaymentModal(false)})}}>
                                    <Text style={{color: 'black'}}>{payment["brand"]} ending in {payment["lastFour"]}</Text>
                                   <Text>
                                    {
                                        payment.payment_id === authContext.defaultPaymentId ? <MaterialCommunityIcons name="check" size={20} color='green' style={{position: 'absolute', right: 10, marginTop: 10, marginRight: 10}}/> : null
                                    }  </Text>

                                    <View style={{position: 'absolute', right: 0, marginTop: 5, backgroundColor: '#ebf0f0', padding: 5, borderRadius: 10}}>
                                        <Text style={{color: 'gray', fontSize: 10}}>
                                            Set as default
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    })} 

                {authContext.paymentMethods.length === 0 ?
                        <StripeProvider merchantIdentifier="merchant.identifier"
                            publishableKey={"pk_test_51JZinFLzDwIJCChhuq8DoRCrStqSktqj22guQPw1NaReIUa97QsONeJrOCdiKsxVq7nSapVfsXYFwxdzueG9PRgX00Ru6vfnBu"}>
                        <View style={styles.container}>
                        <CardField
                            postalCodeEnabled={true}
                            placeholder={{number: 'XXXX XXXX XXXX XXXX'}}
                            cardStyle = {styles.card}
                            style={styles.cardContainer}
                            onCardChange={cardDetails =>{
                                
                                setCardDetails(cardDetails)
                            }}
                            />
                            
                            <Button disabled = {loading} onPress={()=>getClientSecret()} title="Add Card"/>
                        
                            
                        </View>
                        
                    
                        </StripeProvider>  : null}

                <View style={{height: 50}}></View>
                </ScrollView> 

                <TouchableOpacity
                style={{backgroundColor: 'white',
                borderRadius: 10,
                width: 20,
                height: 20,
                position: 'absolute',
                marginTop: 15,
                marginHorizontal: 20,
                color: 'gray',
                zIndex: 50,
                }}
                onPress={() => {
                    setPaymentModal(false)
                    //navigation.navigate(authContext.prevScreen, authContext.prevScreenParams)
                }}>
                <MaterialCommunityIcons name="close" size={22}/>
            </TouchableOpacity> 

                </View>


            
                    

            </Modal>
            
            <View style={{flexDirection: 'row', 
                backgroundColor: 'white',
                borderRadius: 10,
                height: 20,
                position: 'absolute',
                marginTop: 50,
                marginHorizontal: 10,
                
                zIndex: 50,}}>
            <TouchableOpacity
                style={{
                }}
                onPress={() => {
                    navigation.pop(1)               }}>
                <MaterialCommunityIcons name="arrow-left" size={22}/>
            </TouchableOpacity> 
             <Text style={{fontWeight: 'bold', fontSize: 18, marginLeft: 10}}>Drinkly Cash</Text>
            
            </View>
        </View>
    )
}

const styles=StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        width: '95%',
        alignSelf: 'center',
        marginTop: 20

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
        height: 30,
        borderRadius: 5,
        padding: 5,
        margin: '2.5%'
    }
    })