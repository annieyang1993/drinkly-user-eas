import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import { Linking, ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions } from 'react-native';
import { NavigationContainer, useNavigation, CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemModal from '../pages/ItemModal'
import {Firebase, db} from '../config/firebase';
import ScrollPicker from 'react-native-wheel-scroll-picker';


export default function Receipt(){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation()

    const [test, setTest] = useState(authContext.dateTimeArray[Object.keys(authContext.dateTimeArray)[0]])
    const [dateIndex, setDateIndex] = useState(0)
    const [timeIndex, setTimeIndex] = useState(0)
    const [tips, setTips] = useState(0)
    const [tipIndex, setTipIndex] = useState(1)
    const [paymentModal, setPaymentModal] = useState(false)
    const tipsArray = ['No tip', '5%', '10%', '15%', '18%'];

    const getOrders = async()=>{
        const tempOrders = []
        const orders = await Firebase.firestore().collection('users')
                                .doc(`${authContext.user.uid}`)
                                .collection('orders').orderBy('created_at', 'desc').limit(10).get()
        orders.docs.map((order, i)=>{
            tempOrders.push(order.data());
        })

        authContext.setOrderList(tempOrders);            
    }

    return(
        <View style={{backgroundColor: 'white', width: '100%'}}>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: Dimensions.get("screen").height, width: '100%', backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 50}}>
                {!(authContext.cartRestaurant===undefined) ? <View style={{height: '100%', width: '100%'}}>
                <Text style={{marginTop: 70, alignSelf: 'center', fontWeight: 'bold', fontSize: 16}}>Thank you for your order from: </Text>
                <Text style={{alignSelf: 'center', fontWeight: 'bold', fontSize: 17, color: '#119aa3'}}>{authContext.cartRestaurant.restaurant.name}</Text>
                <Text style={{paddingVertical: 10, alignSelf: 'center', paddingTop: 30, marginLeft: 10, fontWeight: 'bold'}}>Please pick up your order at:</Text>
                <Text style={{alignSelf: 'center'}}> {Object.keys(authContext.dateTimeArray)[authContext.dayIndex]}, {(authContext.dateTimeArray[Object.keys(authContext.dateTimeArray)[authContext.dayIndex]][authContext.timeIndex]).toLowerCase()} </Text>
                <Text style={{paddingVertical: 10, alignSelf: 'center', paddingTop: 30, marginLeft: 10, fontWeight: 'bold'}}>From the following location: </Text>
                <Text style={{alignSelf: 'center'}}>{authContext.cartRestaurant.restaurant.street[0]}, {authContext.cartRestaurant.restaurant.state}, {authContext.cartRestaurant.restaurant.country}</Text>
                <TouchableOpacity 
                onPress={()=>{Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${authContext.cartRestaurant.restaurant.street[0].split(' ').join("+")}%2C+${authContext.cartRestaurant.restaurant.state.split(' ').join('+')}&travelmode=walking`);}}>
                    <Image style={{marginTop: 30, alignSelf: 'center', height: 100, borderRadius: 10, width: 100}}source={require("../assets/Map.png")}/>
                    <Text style={{alignSelf: 'center', color: 'gray'}}>Get directions</Text>
                </TouchableOpacity>
            
                <Text style={{paddingVertical: 10, alignSelf: 'center', paddingTop: 70, marginLeft: 10, fontWeight: 'bold'}}>You've earned {authContext.cartRestaurant.restaurant.points_per_purchase} point from </Text>            
                <Text style={{paddingVertical: 10, alignSelf: 'center', marginLeft: 10, fontWeight: 'bold'}}>{authContext.cartRestaurant.restaurant.name} </Text>            
                <MaterialCommunityIcons name="ticket" size={50} style={{alignSelf: 'center', color: '#119aa3'}}/> 
                </View> : null}
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
                    navigation.navigate("Orders");
                    
                    authContext.setCartBool(false);
                    authContext.updateCart([]);
                    authContext.setItemTotals([]);
                    // authContext.setWeekDayArray(['Today']);
                    // authContext.setDateTimeArray({});
                    authContext.setCartRestaurantHours({});
                    authContext.setBeforeOpen(false);
                    authContext.setAfterClose(false);
                    authContext.setCartSubTotal(0);
                    authContext.setTaxes(0);
                    authContext.setServiceFee(0);
                    authContext.setDayIndex(0);
                    authContext.setTimeIndex(0);
                    authContext.setTip(0);
                    authContext.setDiscountCode('');
                    authContext.setDiscount(0);
                    authContext.setDiscountBool(false);
                    authContext.setTipIndex(1)
        

                    getOrders();

                    navigation.dispatch(CommonActions.reset({index: 0, routes:[{name: 'Search2'}]}))
                    
                }}>
                <MaterialCommunityIcons name="close" size={22}/>
            </TouchableOpacity> 
            
        </View>
    )
}