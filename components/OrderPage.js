import React, { useEffect, useContext, useState } from 'react';

import { TouchableOpacity, TouchableHighlight, ScrollView, SlideModal, Button, Modal, TextInput, View, Text, StyleSheet, Dimensions, Image } from 'react-native'
import client from '../api_util/mobile_api_util.js';
import AuthContext from '../context/Context'
import {NavigationContainer, useNavigationContainerRef, useNavigation} from '@react-navigation/native'


function OrderPage({route}){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const timeCreated = route.params.order["created_at"].split("Z")[0].split("T")[1].split(":")
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString({hour: '2-digit', minute:'2-digit', second: '0-digit'}));
    var intervalId = 0;

    var hours = timeCreated[0]
    if (hours<4){
        hours = hours-4+24;
    } else{
        hours = hours-4
    }
    const minutes = timeCreated[1]
    //const correctDate = new Date(date).toDateString().split(" ");
    var readyByHours = 0;
    var readyByMins = 0;

    if (readyByMins+route.params.order["ready_in"]<60){
        readyByHours = hours;
        readyByMins = Number(timeCreated[1])+Number(route.params.order["ready_in"])
    } else{
        readyByHours = hours+1;
        readyByMins = Number(timeCreated[1])+Number(route.params.order["ready_in"]) - 60
    }

    if (readyByMins<10){
        readyByMins = "0"+String(readyByMins)
    }

    const fillOrder = async(id, date)=>{
        const response = await client.patch(`/order_sessions/${id}`, {filled: true, filled_at: date})
        if (response.ok){
            refreshOrders();
        }
    }

    const markComplete = async(id, date)=>{
        const response = await client.patch(`/order_sessions/${id}`, {completed: true, completed_at: date})
        if (response.ok){
            refreshOrders();
        }
    }

    const acceptOrder = async(id, date)=>{
        const response = await client.patch(`/order_sessions/${id}`, {accepted: true, accepted_at: date})
        if (response.ok){
            refreshOrders();
        }
    }

    const refreshOrders = async () =>{
      const response = await client.get(`/order_sessions/accepted_orders/${authContext.restaurantId}`, {restaurant_id: authContext.restaurantId});
    
      authContext.setAcceptedOrders(Object.values(response.data).reverse());
    }

        useEffect(()=>{
        intervalId = setInterval(()=>{
         setCurrentTime(new Date().toLocaleTimeString({hour: '2-digit', minute:'2-digit', second: '0-digit'}))
         
      
    }, 1000)
      
      return () => {
        clearInterval(intervalId);
      }
        }, []);
    var time = (new Date(route.params.order["ready_at"])).toLocaleTimeString().split(":")
    var displayTime = time[0]+":"+time[1]+" "+time[2].split(" ")[1]
    var dueIn = ((route.params.order["ready_at"] - (new Date().getTime()))/60000).toFixed(0)
    return(
        <ScrollView showsVerticalScrollIndicator={false} style={{height: '100%', backgroundColor: '#d7d6d6'}}>

            {route.params.order["filled"] ? 
            <View style={{width: '95%', alignSelf: 'center', backgroundColor: 'white', alignItems: 'center', paddingTop: 20, marginTop: 10, borderRadius: 5}}>
            <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Have order ready by {displayTime}</Text>
            <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Order filled at {new Date(route.params.order["filled_at"]).toLocaleTimeString().split(":")[0]
            + ":"+new Date(route.params.order["filled_at"]).toLocaleTimeString().split(":")[1]+" "+new Date(route.params.order["filled_at"]).toLocaleTimeString().split(":")[2].split(" ")[1]}</Text>
            </View>: 

            <View>

            {dueIn < 6 ? 
            
            <View style={{width: '95%', alignSelf: 'center', backgroundColor: '#efb1ba', alignItems: 'center', paddingTop: 20, marginTop: 10, borderRadius: 5}}>
            <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Have order ready by {displayTime}</Text>

            {dueIn < 1 ? 
            <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Order due {dueIn*(-1)} mins ago</Text> : <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Due in {((route.params.order["ready_at"] - (new Date().getTime()))/60000).toFixed(0)} mins</Text>}

            </View> : <View style={{width: '95%', alignSelf: 'center', backgroundColor: 'white', alignItems: 'center', paddingTop: 20, marginTop: 10, borderRadius: 5}}>
            <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Have order ready by {displayTime}</Text>

            {dueIn < 1 ? 
            <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Order due {dueIn*(-1)} mins ago</Text> : <Text numberOfLines={1} style={{fontSize: 20, textAlign: 'center', alignSelf: 'center', fontWeight: 'bold', color: 'gray', paddingBottom: 20}}>
            Due in {((route.params.order["ready_at"] - (new Date().getTime()))/60000).toFixed(0)} mins</Text>}

            </View>

}</View>}

            <View style={{width: '95%', alignSelf: 'center', backgroundColor: 'white', alignItems: 'center', marginTop: 10, borderRadius: 5}}>
            {Object.values(route.params.order["orders"]).map((ele, i)=>{
                return(<View key={i} style={{flexDirection: 'row', width: '95%', paddingTop: 30, paddingBottom: 30, borderBottomWidth: 0.5, borderBottomColor: 'gray'}}>
                    <Text style={{width: '10%', fontSize: 16, color: 'gray', fontWeight:'bold',alignSelf: 'center', textAlign: 'center'}}>{ele["quantity"]}x</Text>
                    <Text style={{width: '70%', fontSize: 16, color: 'gray', fontWeight:'bold',}}>{ele["item_name"]}</Text>
                    <Text style={{width: '20%', fontSize: 16, color: 'gray', fontWeight:'bold',textAlign: 'right', marginRight: 20, paddingRight: 10}}>${authContext.rounded(ele["price"]).toFixed(2)}</Text>
                    </View>)
            })}

            <View style={{width: '95%', paddingBottom: 20}}>
                <View style={{flexDirection: 'row', padding: 10, paddingTop: 20}}>
                    <Text style={{width: '30%', alignSelf: 'center', textAlign: 'left', fontWeight: 'bold', fontSize: 16}}>Subtotal:</Text>
                    <Text style={{width: '70%', alignSelf: 'center', textAlign: 'right', fontWeight: 'bold', fontSize: 16}}>${authContext.rounded(route.params.order["subtotal"]).toFixed(2)}</Text>
                </View>
                <View style={{flexDirection: 'row', padding: 10}}>
                    <Text style={{width: '30%', alignSelf: 'center', textAlign: 'left', fontWeight: 'bold', fontSize: 16}}>Taxes:</Text>
                    <Text style={{width: '70%', alignSelf: 'center', textAlign: 'right', fontWeight: 'bold', fontSize: 16}}>${authContext.rounded(route.params.order["taxes"]).toFixed(2)}</Text>
                </View>

                <View style={{flexDirection: 'row', padding: 10}}>
                    <Text style={{width: '30%', alignSelf: 'center', textAlign: 'left', fontWeight: 'bold', fontSize: 16}}>Service Fee:</Text>
                    <Text style={{width: '70%', alignSelf: 'center', textAlign: 'right', fontWeight: 'bold', fontSize: 16}}>${authContext.rounded(route.params.order["service_fee"]).toFixed(2)}</Text>
                </View>
                <View style={{flexDirection: 'row', padding: 10}}>
                    <Text style={{width: '30%', alignSelf: 'center', textAlign: 'left', fontWeight: 'bold', fontSize: 16}}>Total:</Text>
                    <Text style={{width: '70%', alignSelf: 'center', textAlign: 'right', fontWeight: 'bold', fontSize: 16}}>${authContext.rounded(route.params.order["total"]).toFixed(2)}</Text>
                </View>
                    </View>
            </View>

            {route.params.order["completed"]===true ? <View></View> : <View>
            {route.params.order["accepted"]===false ? <TouchableOpacity 
                style={{width: '70%', alignSelf: 'center', backgroundColor: '#f4f3f3', alignItems: 'center', margin: 30, padding: 20, borderRadius: 25}}
                onPress={()=>{
                const date = new Date();
                acceptOrder(route.params.order["id"], date)
                navigation.navigate("Orders")
            }}><Text style={{textAlign: 'center', width: '100%', fontWeight: 'bold', color: '#636363', fontSize: 20}}>Accept Order</Text></TouchableOpacity> : <View>
                {route.params.order["filled"]===false ? 
                <TouchableOpacity 
                style={{width: '70%', alignSelf: 'center', backgroundColor: '#f4f3f3', alignItems: 'center', margin: 30, padding: 20, borderRadius: 25, shadowOffset: { width: 1, height: 1 }, shadowColor: '#000', shadowOpacity: 0.5, elevation: 5,}}
                onPress={()=>{
                const date = new Date();
                fillOrder(route.params.order["id"], date)
                navigation.navigate("Orders")
            }}><Text style={{textAlign: 'center', width: '100%', fontWeight: 'bold', color: '#636363', fontSize: 20}}>Mark Ready (Filled)</Text></TouchableOpacity> : 
            <TouchableOpacity 
                style={{width: '70%', alignSelf: 'center', backgroundColor: '#f4f3f3', alignItems: 'center', margin: 30, padding: 20, borderRadius: 25, shadowOffset: { width: 1, height: 1 }, shadowColor: '#000', shadowOpacity: 0.5, elevation: 5,}}
                onPress={()=>{
                const date = new Date();
                markComplete(route.params.order["id"], date)
                navigation.navigate("Orders")
            }}><Text style={{textAlign: 'center', width: '100%', fontWeight: 'bold', color: '#636363', fontSize: 20}}>Mark Complete</Text></TouchableOpacity>}</View>}
            
            </View>}
            {/* <Text>{route.params.order["id"]}</Text>*/}
            
            
            </ScrollView> 
    )
}

export default OrderPage