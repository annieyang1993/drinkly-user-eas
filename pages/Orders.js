import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, TouchableOpacity, StyleSheet, Text, View, Dimensions} from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';

export default function Orders({navigation}){
    const authContext = useContext(AuthContext);
    const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

    const getOrder = async (order) => {
        const items = await Firebase.firestore()
                                .collection('users')
                                .doc(`${authContext.user.uid}`)
                                .collection('orders')
                                .doc(order["order_id"])
                                .collection('items').get();
        const items_list = [];
        items.docs.map((preference, i)=>{
            items_list.push(preference.data());
        })

        return items_list;
    }

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: 30, marginHorizontal: 10}}>Orders</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: '100%'}}>
            {authContext.orderList.length === 0 ? <Text style={{alignSelf: 'center', marginTop: 250}}>You have no orders yet.</Text>:  null}
            {authContext.orderList.map((order, i)=>{
                if (order["accepted"]===undefined || order["accepted"]===false){
                    return(<TouchableOpacity key={i} onPress={async ()=>{
                        const items_list = await getOrder(order);
                        navigation.navigate("Order Page", {order: order, items_list: items_list, status: 'Waiting to be accepted'})}}>
                        <View style={{backgroundColor: '#dff8dd', width: '100%', height: 90, padding: 10, marginVertical: 5, width: Dimensions.get("screen").width*0.93, alignSelf: 'center', borderRadius: 10, shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 5, shadowOpacity: 0.8,}}>
                            <View style={{flexDirection: 'row', width: '100%'}}>
                                <Text style={{fontWeight: 'bold'}}>{order["restaurant_name"]}</Text>
                                <Text style = {{alignSelf: 'flex-end', fontWeight: 'bold', position: 'absolute', right: 10, color: 'gray'}}>Active</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text>${(authContext.rounded((order["subtotal"]))-authContext.rounded(Number(order["discount"])).toFixed(2)+authContext.rounded(order["tip"])+authContext.rounded(order["taxes"])+authContext.rounded(Number(order["service_fee"]) + Number(order["extraStripeCharge"]))).toFixed(2)}</Text>
                                {order["number_of_items"]===1 ? 
                                <Text> - {order["number_of_items"]} item</Text> : <Text> - {order["number_of_items"]} items</Text>}
                            </View>
                            <View style={{flexDirection: 'row', marginTop: 15}}>
                                <Text>{monthList[new Date(order["created_at"]["seconds"]*1000).getMonth()]} {new Date(order["created_at"]["seconds"]*1000).getDate()}</Text>
                                <Text> - Order placed - Waiting to be accepted</Text>
                            </View>
                        </View>
                    </TouchableOpacity>) 
                } else if (order["filled"]===undefined || order["filled"]===false){
                    return(<TouchableOpacity key={i} onPress={async ()=>{
                        const items_list = await getOrder(order);
                        navigation.navigate("Order Page", {order: order, items_list: items_list, status: 'Waiting to be filled'})}}>
                        <View style={{backgroundColor: '#dff8dd', padding: 10, height: 90, marginVertical: 5, width: Dimensions.get("screen").width*0.93, alignSelf: 'center', borderRadius: 10, shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 5, shadowOpacity: 1,}}>
                            <View style={{flexDirection: 'row', width: '100%'}}>
                                <Text style={{fontWeight: 'bold'}}>{order["restaurant_name"]}</Text>
                                <Text style = {{alignSelf: 'flex-end', fontWeight: 'bold', position: 'absolute', right: 10, color: 'gray'}}>Active</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text>${(authContext.rounded((order["subtotal"]))-authContext.rounded(Number(order["discount"])).toFixed(2)+authContext.rounded(order["tip"])+authContext.rounded(order["taxes"])+authContext.rounded(Number(order["service_fee"]) + Number(order["extraStripeCharge"]))).toFixed(2)}</Text>
                                {order["number_of_items"]===1 ? 
                                <Text> - {order["number_of_items"]} item</Text> : <Text> - {order["number_of_items"]} items</Text>}
                            </View>
                            <View style={{flexDirection: 'row', marginTop: 15}}>
                                <Text>{monthList[new Date(order["created_at"]["seconds"]*1000).getMonth()]} {new Date(order["created_at"]["seconds"]*1000).getDate()}</Text>
                                <Text> - Accepted - Waiting to be filled</Text>
                            </View>
                        </View>
                    </TouchableOpacity>) 
                } else if (order["completed"]===undefined || order["completed"]===false){
                    return(<TouchableOpacity key={i} onPress={async ()=>{
                        const items_list = await getOrder(order);
                        navigation.navigate("Order Page", {order: order, items_list: items_list, status: 'Waiting to be picked up'})}}>
                        <View style={{backgroundColor: '#dff8dd', padding: 10, height: 90, marginVertical: 5, width: Dimensions.get("screen").width*0.93, alignSelf: 'center', borderRadius: 10, shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 5, shadowOpacity: 1,}}>
                            <View style={{flexDirection: 'row', width: '100%'}}>
                                <Text style={{fontWeight: 'bold'}}>{order["restaurant_name"]}</Text>
                                <Text style = {{alignSelf: 'flex-end', fontWeight: 'bold', position: 'absolute', right: 10, color: 'gray'}}>Active</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text>${(authContext.rounded((order["subtotal"]))-authContext.rounded(Number(order["discount"])).toFixed(2)+authContext.rounded(order["tip"])+authContext.rounded(order["taxes"])+authContext.rounded(Number(order["service_fee"]) + Number(order["extraStripeCharge"]))).toFixed(2)}</Text>
                                {order["number_of_items"]===1 ? 
                                <Text> - {order["number_of_items"]} item</Text> : <Text> - {order["number_of_items"]} items</Text>}
                            </View>
                            <View style={{flexDirection: 'row', marginTop: 15}}>
                                <Text>{monthList[new Date(order["created_at"]["seconds"]*1000).getMonth()]} {new Date(order["created_at"]["seconds"]*1000).getDate()}</Text>
                                <Text> - Filled - Waiting to be picked up</Text>
                            </View>
                        </View>
                    </TouchableOpacity>) 
 
                } else{
                    return(<TouchableOpacity key={i} onPress={async ()=>{
                        const items_list = await getOrder(order);
                        navigation.navigate("Order Page", {order: order, items_list: items_list, status: 'Completed'})}}>
                        <View style={{backgroundColor: '#e8ebeb', padding: 10, height: 90, marginVertical: 5, width: Dimensions.get("screen").width*0.93, alignSelf: 'center', borderRadius: 10, shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 5, shadowOpacity: 1,}}>
                            <View style={{flexDirection: 'row', width: '100%'}}>
                                <Text style={{fontWeight: 'bold'}}>{order["restaurant_name"]}</Text>
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text>${(authContext.rounded((order["subtotal"]))-authContext.rounded(Number(order["discount"])).toFixed(2)+authContext.rounded(order["tip"])+authContext.rounded(order["taxes"])+authContext.rounded(Number(order["service_fee"]) + Number(order["extraStripeCharge"]))).toFixed(2)}</Text>
                                {order["number_of_items"]===1 ? 
                                <Text> - {order["number_of_items"]} item</Text> : <Text> - {order["number_of_items"]} items</Text>}
                            </View>
                            <View style={{flexDirection: 'row', marginTop: 15}}>
                                <Text>{monthList[new Date(order["created_at"]["seconds"]*1000).getMonth()]} {new Date(order["created_at"]["seconds"]*1000).getDate()}</Text>
                                <Text> - Completed</Text>
                            </View>
                        </View>
                    </TouchableOpacity>) 

                }
            })} 
            <View style={{height: 200, width: '100%'}}></View>
            </ScrollView>
            </View>
        </View>    )

}

const styles = StyleSheet.create({

    container: {
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: 'center',
    marginTop: 50,
    zIndex: 2,
    width: '100%'
  }
})