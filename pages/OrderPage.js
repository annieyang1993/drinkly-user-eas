import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
//import CachedImage from 'react-native-expo-cached-image'

export default function OrderPage({route}){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const [loadingPicture, setLoadingPicture] = useState(false);

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', paddingTop: 50, backgroundColor: 'white'}}>
            <Text style={{alignSelf: 'center', fontSize: 15, fontWeight: '500'}}>ORDER #{route.params.order.order_id.split('.')[1].toUpperCase()}</Text>
            <ScrollView>
            <Image style = {{height: 200, width: '100%', marginTop: 15}} source={{uri: route.params.order["restaurant_image"]}} onLoadStart={() => {
                setLoadingPicture(true)}} 
                onLoadEnd={() => {
                setLoadingPicture(false)
                }}/>
            {loadingPicture ? <ActivityIndicator size="large" style={{alignSelf: 'center', marginTop: -100, marginBottom: 90}}/> : null}
            <View style={{width: '95%', alignSelf: 'center', paddingTop: 20, padding: 10}}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>{route.params.order.restaurant_name}</Text>
                <Text>{route.params.status} - {new Date(route.params.order.ready_by.seconds*1000).toLocaleDateString()}</Text>
                <Text style={{fontSize: 17, fontWeight: 'bold', marginTop: 30, marginBottom: 15}}>Items</Text>
                {route.params.items_list.map((item, i)=>{
                    return(
                        <View key={i} style={{flexDirection: 'row', paddingVertical: 15, paddingTop: 25, marginHorizontal: 30, borderBottomWidth: 1, borderBottomColor: 'gray'}}>
                            <Text style={{fontSize: 15, color: 'gray'}}>{item["quantity"]} x </Text>
                            <Text style={{fontSize: 15, color: 'gray'}}>{item["name"]}</Text>
                            <Text style={{position: 'absolute', right: 0, marginTop: 25, color: 'gray'}}>${authContext.rounded(item["total_price"]*item["quantity"]).toFixed(2)}</Text>
                        </View>
                    )
                })}
                <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 30, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold'}}>Subtotal </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 25, fontWeight: 'bold'}}>${authContext.rounded(route.params.order["subtotal"]).toFixed(2)}</Text>
                </View>

                <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 20, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold'}}>Taxes </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 20, fontWeight: 'bold'}}>${authContext.rounded(route.params.order["taxes"]).toFixed(2)}</Text>
                </View>

                <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 20, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold'}}>Service fee </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 20, fontWeight: 'bold'}}>${authContext.rounded(route.params.order["service_fee"]).toFixed(2)}</Text>
                </View>

                <View style={{flexDirection: 'row', paddingVertical: 5, paddingTop: 30, marginHorizontal: 30}}>
                    <Text style={{fontSize: 17, fontWeight: 'bold'}}>Total </Text>
                    <Text style={{fontSize: 17, position: 'absolute', right: 0, marginTop: 30, fontWeight: 'bold'}}>${authContext.rounded((route.params.order["subtotal"])+route.params.order["taxes"]+route.params.order["service_fee"]).toFixed(2)}</Text>
                </View>


            </View>
            </ScrollView>
            <TouchableOpacity
            style={{backgroundColor: 'white',
            borderRadius: 10,
            width: 20,
            height: 20,
            position: 'absolute',
            marginTop: 50,
            marginHorizontal: 20,
            color: 'gray',
            zIndex: 50,
            }}
            onPress={()=>{navigation.navigate("Order List")}}>
            <MaterialCommunityIcons name="arrow-left" size={22}/>
        </TouchableOpacity> 
        </View>
        )

}