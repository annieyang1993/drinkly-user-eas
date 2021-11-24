import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import {Button, ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemModal from '../pages/ItemModal'
import {Firebase, db, functions} from '../config/firebase';
import {Stripe, CardField, StripeProvider,useConfirmPayment, useConfirmSetupIntent, createToken, createPaymentMethod} from '@stripe/stripe-react-native'
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';

export default function CardPage({route}){
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
    const createEphemeralKey = functions.httpsCallable('createEphemeralKey')
    const { user } = useContext(AuthenticatedUserContext);

    const setPaymentMethod = async (subtotal, tip, taxes) =>{
        const paymentMethodTemp = authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? 'Please select a payment method' : 'Drinkly Cash';
        await authContext.setPaymentMethod(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? 'Please select a payment method' : 'Drinkly Cash')
        await authContext.setIcon(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? '' : 'cash')
        if (paymentMethodTemp === 'Drinkly Cash'){
        await authContext.setServiceFee(0);
        } else{
        await authContext.setServiceFee(0.15);
        }

    }

    const deleteCard = async() =>{
        await Firebase.firestore().collection('users').doc(user.uid).collection('payment_methods').doc(`${route.params.card.brand}-${route.params.card.expiryYear}-${route.params.card.lastFour}`).delete();
        const paymentsTemp = authContext.paymentMethods.map((x)=>x);
        var cardIndex = 0;
        paymentsTemp.map((payment, i)=>{
            if (payment["brand"]===route.params.card.brand && payment["expiryYear"]===route.params.card.expiryYear && payment["lastFour"]===route.params.card.lastFour){
                cardIndex = i;
            }
        })
        await paymentsTemp.splice(cardIndex, 1);
        await authContext.setPaymentMethods(paymentsTemp);

        if (route.params.card.payment_id === authContext.defaultPaymentId){
            await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
                default_payment_id: null,
                default_brand: null,
                default_lastFour: null
            }, {merge: true});
            const userDataTemp = authContext.userData;
            delete userDataTemp["default_payment_id"];
            delete userDataTemp["default_brand"];
            delete userDataTemp["default_lastFour"];
            await authContext.setUserData(userDataTemp);
            await authContext.setDefaultPaymentId('');
            await setPaymentMethod(authContext.cartSubTotal, authContext.tip, authContext.taxes);
        }
    }

    const makeDefault = async() =>{
        await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
                default_payment_id: route.params.card.payment_id,
                default_brand: route.params.card.brand,
                default_lastFour: route.params.card.lastFour
            }, {merge: true});

        const userDataTemp = authContext.userData;
        userDataTemp["default_payment_id"] = route.params.card.payment_id;
        userDataTemp["default_brand"] = route.params.card.brand;
        userDataTemp["default_lastFour"]  = route.params.card.lastFour;
        await authContext.setUserData(userDataTemp);
        await authContext.setDefaultPaymentId(route.params.card.payment_id);

    }

    return(
        <View style={{backgroundColor: 'white'}}>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: Dimensions.get("screen").height, backgroundColor: 'white', paddingTop: 80}}>

                <View style={{width: '92%', alignSelf: 'center', borderRadius: 15, borderWidth: 1, borderColor: 'lightgray', marginTop: 20, backgroundColor: 'white', shadowColor: 'black', 
                    shadowOffset: {width: 3, height: 3}, 
                    shadowRadius: 10, 
                    shadowOpacity: 0.3}}>
                    <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                        <Text style={{alignSelf: 'center', fontSize: 17, fontWeight: '500', margin: 10, marginTop: 25}}>{route.params.card.brand}</Text>
                        {route.params.card.payment_id === authContext.defaultPaymentId ?
                        <MaterialCommunityIcons name="check-circle" color='green' size={20} style={{marginTop: 25}}/> : null}
                    </View>


                    <Text style={{alignSelf: 'center', fontSize: 20, fontWeight: '600', margin: 10}}>* * * *  * * * *  * * * *  {route.params.card.lastFour}</Text>
                    <Text style={{alignSelf: 'center', margin: 10, fontSize: 15}}>Expiring {route.params.card.expiryMonth}/{route.params.card.expiryYear}</Text>
                    <View style={{flexDirection: 'row'}}>
                        {route.params.card.payment_id === authContext.defaultPaymentId ? <Text style={{margin: 25, color: 'lightgray'}}>Make default</Text> :
                        <TouchableOpacity style={{margin: 25, color: 'gray'}} onPress={()=>{makeDefault()}}>  
                            <Text style={{color: 'gray'}}>Make default</Text>
                        </TouchableOpacity> }

                        <TouchableOpacity style={{margin: 25, position: 'absolute', right: 0}} onPress={async ()=>{deleteCard().then(()=>navigation.pop(1))}}>
                            <Text style={{color: 'gray'}}>Delete card</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                
                
            </ScrollView>
            <View style={{flexDirection: 'row', backgroundColor: 'white',
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
                    navigation.pop(1)
                }}>
                <MaterialCommunityIcons name="arrow-left" size={22}/>
            </TouchableOpacity> 
             <Text style={{fontWeight: 'bold', fontSize: 18, marginLeft: 10}}>Credit Card</Text>
            
            </View>
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