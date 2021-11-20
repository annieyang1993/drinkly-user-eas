import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, ScrollView, TouchableOpacity, StyleSheet, Text, View, Dimensions} from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import InputField from '../components/InputField'

export default function PaymentMethods({navigation}){
    const authContext = useContext(AuthContext);

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{height: '100%', width: '100%', marginTop: 50}}>
                <View style={{width: '95%', alignSelf: 'center'}}>
                    <View style={{width: '100%', flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: 'bold'}}>Drinkly Cash</Text>
                        <TouchableOpacity style={{position: 'absolute', right: 0}}>
                            <Text style={{color: 'gray'}}>+ Add Drinkly Cash</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{alignSelf: 'center', color: '#a7a9a9', fontSize: 40, fontWeight: '400', marginTop: 20, width: '95%', textAlign: 'center', paddingVertical: 20, borderRadius: 15}}>${authContext.userData.drinkly_cash === undefined ? 0 : authContext.userData.drinkly_cash}</Text>
                    <View style={{width: '100%', flexDirection: 'row', marginTop: 20, marginBottom: 20}}>
                        <Text style={{fontSize: 16, fontWeight: 'bold'}}>Credit Cards</Text>
                    </View>

                    {authContext.paymentMethods.map((payment, i)=>{
                        return (
                            <View key={i} style={{width: '100%', borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                                <TouchableOpacity style={{width: '100%', flexDirection: 'row', padding: 5}} onPress={()=>{navigation.navigate("Credit Card", {card: payment})}}>
                                    <Text>{payment["brand"]} ending in {payment["lastFour"]}</Text>
                                    <MaterialCommunityIcons name="check" size={20} color='green' style={{position: 'absolute', right: 10, marginRight: 10}}/>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color='gray' style={{position: 'absolute', right: 0}}/>
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