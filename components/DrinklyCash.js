import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import {Switch, Button, ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions, KeyboardAvoidingView } from 'react-native';
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
    const [errorBool, setErrorBool] = useState(false);
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
    const [addingCashState, setAddingCashState] = useState(0);
    const [addingCardState, setAddingCardState] = useState(0);

    const [errorMessageCard, setErrorMessageCard] = useState('');
    

    const toggleSwitch = async () => {
        const tempBool = !authContext.drinklyCash;
        
        await setPaymentMethod(authContext.cartSubTotal, authContext.tip, authContext.taxes, !authContext.drinklyCash);
        await authContext.setDrinklyCash(!authContext.drinklyCash)
        await Firebase.firestore().collection('users').doc(`${cred.user.uid}`).set({drinkly_bool: !authContext.drinklyCash}, {merge: true});
        // await authContext.setPaymentMethod(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < authContext.cartSubTotal || tempBool === false ? (authContext.defaultPaymentId=== undefined || authContext.defaultPaymentId=== '' ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
        // await authContext.setIcon(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (authContext.cartSubTotal) || tempBool === false ? (authContext.defaultPaymentId === undefined || authContext.defaultPaymentId=== '' ? '' : 'credit-card') : 'cash')
        // if (tempBool === true){
        //     authContext.setServiceFee(0);
        // } else{
        //     authContext.setServiceFee(0.15);
        // }
    }

    const setPaymentMethod = async (subtotal, tip, taxes, bool) =>{
        console.log("FIGURING THIS OUT", authContext.defaultPaymentId)
        const paymentMethodTemp = authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || bool === false ? (authContext.defaultPaymentId=== undefined || authContext.defaultPaymentId === '' ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash';
        await authContext.setPaymentMethod(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || bool === false ? (authContext.defaultPaymentId=== undefined || authContext.defaultPaymentId === ''? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
        await authContext.setIcon(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || bool === false ? (authContext.defaultPaymentId=== undefined || authContext.defaultPaymentId === ''? '' : 'credit-card') : 'cash')
        if (paymentMethodTemp === 'Drinkly Cash'){
        await authContext.setServiceFee(0);
        } else{
        await authContext.setServiceFee(0.15);
        }

    }

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
            const addition = authContext.rounded(amountIndex === -1 ? Number(amount) : Number(amounts[amountIndex]));
            const sum = drinklyCashTemp + addition;
            await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
                drinkly_cash: authContext.rounded(sum).toFixed(2)
            }, {merge: true});
            const userDataTemp = authContext.userData;
            userDataTemp["drinkly_cash"] = sum;
            authContext.setDrinklyCashAmount(sum);
            await authContext.setUserData(userDataTemp);
        }
        await setAddingCash(false);
        await setAddingCashState(2);
        await new Promise(res => setTimeout(res, 1000))
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
        const response = await fetch('https://us-central1-drinkly-user.cloudfunctions.net/createCharge', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: authContext.userData.stripeId,
                amount: (authContext.rounded(amountIndex === -1 ? Number(amount) : amounts[amountIndex])*100).toFixed(0),
                payment_id: authContext.userData.default_payment_id
            })
        })
        const responseJson = await response.json();
    }




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
            setErrorBool(true);
            setErrorMessageCard('Card error, please try again')
            setLoading(false);
        } else{
            setErrorBool(false)
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

                <View style={{flexDirection: 'row', width: '90%', alignSelf: 'center', marginVertical: 10, opacity: authContext.drinklyCash ? 1 : 0.5}}>
                        <Text style={{fontWeight: 'bold', fontSize: 12, marginTop: 15}}>Use Drinkly Cash to pay</Text>


                        <Text style={{alignSelf: 'center', marginTop: 15, color: 'gray', position: 'absolute', right: 0}}>{authContext.drinklyCash ? "On" : "Off"}</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#8fd7dc" }}
                            style={{position: 'absolute', right: 25}}
                            thumbColor={authContext.drinklyCash ? "#44bec6" : "#f4f3f4"}
                            onValueChange={()=>toggleSwitch()}
                            value={authContext.drinklyCash}
                        />
                        
                    </View>
                <View>

                <View style={{width: '90%', marginBottom: 20, borderRadius: 15, height: 150, backgroundColor: 'white', shadowColor: 'black', marginTop: 20, opacity: authContext.drinklyCash ? 1 : 0.5, shadowOffset: {width: 3, height: 3}, shadowRadius: 10, shadowOpacity: 0.3, alignSelf: 'center'}}>
                
                    <View>
                    <Text style={{alignSelf: 'center', marginBottom: 50, color: '#a7a9a9', fontSize: 40, fontWeight: '400', marginTop: 30, width: '90%', textAlign: 'center', paddingVertical: 20, borderRadius: 15, }}>${authContext.userData.drinkly_cash === undefined ? 0 : authContext.rounded(Number(authContext.userData.drinkly_cash).toFixed(2))}</Text>
                    </View>
                </View>

                <View>
                {amounts.map((amount, i)=>{
                    return (
                    <View  key={i} style={{width: '80%',  alignSelf: 'center', backgroundColor: '#eff3f3', marginVertical: 5, borderRadius: 10}}>
                    <TouchableOpacity style={{padding: 15, flexDirection: 'row'}} onPress={()=>{setAmountIndex(i)}}>
                        <Text style={{color: '#747575'}}>Add ${amount}</Text>
                        {amountIndex === i ? <MaterialCommunityIcons name="check" color='green' size={25} style={{position: 'absolute', right: 10, marginTop: 13}}/> : null}
                    </TouchableOpacity>
                    </View>)
                })}
                </View>
                </View>

                <View  style={{width: '80%', alignSelf: 'center', borderBottomColor: 'lightgray', borderRadius: 10, backgroundColor: '#eff3f3'}}>
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
                            borderColor: 'lightgray',
                            
                            

                            }}
                            placeholder='Enter amount'
                            keyboardType='number-pad'
                            autoFocus={false}
                            value={amount}
                            onChangeText={text => {
                            setAmount(text);
                            setAmountIndex(-1)}}
                        />
                        {amountIndex === -1 ? <MaterialCommunityIcons name="check" color='green' size={25} style={{position: 'absolute', right: 10, marginTop: 13}}/> : null}
                    </TouchableOpacity>
                </View>

                <Text style={{alignSelf: 'center', color: 'red', marginTop: 20}}>{errorMessage}</Text>

                
                
            </ScrollView>

                    {addingCashState === 2 ? <MaterialCommunityIcons name="check-circle" style={{position: 'absolute', bottom: '18%', alignSelf: 'center'}} size={25} color='green'/>  : null}
                    


            <TouchableOpacity style={{marginTop: 200, width: '95%', alignSelf: 'center', position: 'absolute', bottom: '10%', paddingVertical: 11, paddingHorizontal: 30, backgroundColor: '#119aa3', borderRadius: 20, textAlign: 'center', shadowColor: 'black', 
          shadowOffset: {width: 2, height: 2}, 
          shadowRadius: 3, 
          shadowOpacity: 0.6}} 
                        onPress={()=>{
                            addCash();
                            // if (authContext.userData["default_card"]===undefined){
                            //     setPaymentModal(true)
                            // } else{
                            // }
                        }}>
                    <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 16}}>Add {amountIndex !== -1 ? `$${amounts[amountIndex]}` : (amount==='' || isNaN(amount) || amount === undefined ? '' : `$${amount}`)} Drinkly Cash</Text>
            </TouchableOpacity> 
          

            
            <Modal visible={paymentModal} transparent={true} animationType='slide'>
                <KeyboardAvoidingView style={{padding: 20, width: '100%', backgroundColor: 'white', position: 'absolute', bottom: '0%', height: '50%', alignSelf: 'center', borderRadius: 15, shadowColor: 'gray', shadowOffset: {width: 2, height: -2}, shadowRadius: 2, shadowOpacity: 0.4}}>
                
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

                            {errorBool ? <Text>{errorMessageCard}</Text> : <Text></Text>}
                            
                            <Button disabled = {loading} onPress={async ()=>{
                                var cardExists = false;
                        
                                authContext.paymentMethods.map(async (paymentMethod, i)=>{
                                        if (cardDetails.last4 === paymentMethod.lastFour){
                                            
                                            cardExists = true;
                                        }
                                })
                                    if (cardExists === false){
                                        getClientSecret().then(()=>{addCash()})
                                    } else{
                                        await setErrorMessage('You have already added this card.');
                                        await setErrorBool(true);
                                    }
                                
                            }} 
                                
                                
                                 title="Add Card"/>
                        
                            
                        </View>
                        
                    
                        </StripeProvider>  : null}

                <View style={{height: 50}}></View>
                </ScrollView> 

                <TouchableOpacity
                disabled={loading}
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
                    setErrorMessageCard('')
                    //navigation.navigate(authContext.prevScreen, authContext.prevScreenParams)
                }}>

                <MaterialCommunityIcons name="close" size={22}/>
            </TouchableOpacity> 

                </KeyboardAvoidingView>


            
                    

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
        padding: 5,
        marginTop: -10
        
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