import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Switch, Modal, ScrollView, TouchableOpacity, StyleSheet, Text, View, Dimensions} from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import InputField from '../components/InputField'

export default function PaymentMethods({navigation}){
    const authContext = useContext(AuthContext);
    const [creditCardModal, setCreditCardModal] = useState(false);

    const toggleSwitch = async () => {
            const tempBool = !authContext.drinklyCash;
            await authContext.setDrinklyCash(!authContext.drinklyCash)
            await authContext.setPaymentMethod(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < authContext.cartSubTotal || tempBool === false ? (authContext.defaultPaymentId=== undefined ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
            await authContext.setIcon(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (authContext.cartSubTotal) || tempBool === false ? (authContext.defaultPaymentId === undefined ? '' : 'credit-card') : 'cash')
            if (tempBool === true){
                authContext.setServiceFee(0);
            } else{
                authContext.setServiceFee(0.15);
            }
     
     
     
        }

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: '100%', width: '100%', marginTop: 50}}>
                <View style={{width: '95%', alignSelf: 'center'}}>
                    <View style={{width: '100%', flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: 'bold'}}>Drinkly Cash</Text>
                        <TouchableOpacity style={{position: 'absolute', right: 0}} onPress={()=>navigation.navigate("Drinkly Cash")}>
                            <Text style={{color: 'gray'}}>+ Add Drinkly Cash</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{flexDirection: 'row', width: '95%', alignSelf: 'center', marginVertical: 10, opacity: authContext.drinklyCash ? 1 : 0.5}}>
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

                    <View style={{backgroundColor: 'white',  marginTop: 20, width: '95%', alignSelf: 'center', borderRadius: 15, height: 150, shadowColor: 'black', shadowOffset: {width: 3, height: 3}, shadowRadius: 10, shadowOpacity: 0.3, opacity: authContext.drinklyCash ? 1 : 0.3}}>
                    <Text style={{alignSelf: 'center', color: '#a7a9a9', fontSize: 40, fontWeight: '400', textAlign: 'center', marginTop: 30, paddingVertical: 20, borderRadius: 15}}>${authContext.drinklyCashAmount === undefined ? 0 : authContext.drinklyCashAmount}</Text>
                    </View>
                    <View style={{width: '100%', flexDirection: 'row', marginTop: 20, marginBottom: 20}}>
                        <Text style={{fontSize: 16, fontWeight: 'bold'}}>Credit Cards</Text>
                    </View>

                    {authContext.paymentMethods.map((payment, i)=>{
                        return (
                            <View key={i} style={{width: '100%', borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                                <TouchableOpacity style={{width: '100%', flexDirection: 'row', padding: 5, paddingVertical: 10}} onPress={()=>{navigation.navigate("Credit Card", {card: payment})}}>
                                    <Text>{payment["brand"]} ending in {payment["lastFour"]}</Text>
                                    {
                                        payment.payment_id === authContext.defaultPaymentId ? <MaterialCommunityIcons name="check" size={20} color='green' style={{position: 'absolute', right: 10, marginTop: 10, marginRight: 10}}/> : null
                                    }
                                    
                                    <MaterialCommunityIcons name="chevron-right" size={20} color='gray' style={{position: 'absolute', right: 0, marginTop: 10}}/>
                                </TouchableOpacity>
                            </View>
                        )
                    })}

                    <TouchableOpacity style={{alignSelf: 'center', marginTop: 30, marginBottom: 100}} onPress={()=>navigation.navigate("Add Payment")}>
                        <Text style={{color: 'gray'}}>+ Add Card</Text>
                    </TouchableOpacity>
                </View>
                
            </ScrollView>

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
             <Text style={{fontWeight: 'bold', fontSize: 18, marginLeft: 10}}>Payment Methods</Text>
            
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