import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, Image, TouchableOpacity, Dimensions, StyleSheet, Text, View, ActivityIndicator, ImageEditor } from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
//import CachedImage from 'react-native-expo-cached-image'

export default function OrderPage({route}){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();
    const [loadingPicture, setLoadingPicture] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addons, setAddons] = useState(new Array(route.params.items_list.length, []));

    useEffect(async ()=>{
        if (authContext.itemsAndAddons[route.params.order["order_id"]]!==undefined){
                setAddons(authContext.itemsAndAddons[route.params.order["order_id"]])
        } else{
            var addonsOuterTemp = []
            var allAddons = authContext.itemsAndAddons;
            setLoading(true);
            var count = 0;
            await route.params.items_list.map(async (item, i)=>{
                addonsOuterTemp.push([]);
                //addonsOuterTemp.push(addonsTemp);
                const addonsFirebase = await Firebase.firestore().collection('users').doc(authContext.user.uid).collection('orders').doc(String(route.params.order["order_id"])).collection('items').doc(String(item.id)).collection('preferences').get().then(async (addonsFirebase)=>{
                    count+=1;
                    await addonsFirebase.docs.map((addon, j)=>{
                        addonsOuterTemp[i].push(addon.data());
                    })
                    setAddons(addonsOuterTemp);
                    if (count === route.params.items_list.length){
                        allAddons[route.params.order["order_id"]] = addonsOuterTemp;
                        authContext.setItemsAndAddons(allAddons);
                        setLoading(false);
                    }
                    
                });
                
            })
        }
    }, [])

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
                        <View key={i} style={{marginHorizontal: 30, paddingBottom: 15}}>
                            <View style={{flexDirection: 'row', paddingBottom: 5, paddingTop: 25}}>
                                <Text style={{fontSize: 15, color: 'gray', width: '10%'}}>{item["quantity"]} x </Text>
                                <Text style={{fontSize: 15, color: 'gray', width: '70%'}}>{item["name"]}</Text>
                                <Text style={{position: 'absolute', right: 0, marginTop: 25, color: 'gray', width: '20%', textAlign: 'right'}}>${authContext.rounded(item["price"]).toFixed(2)}</Text>
                            </View>
                            <View style={{}}>
                                {Object.values(addons[i]).map((addon, j)=>{
                                    if (addon["name"]==="special_instructions"){
                                        return(
                                            <View key = {j} style={{flexDirection: 'row', marginRight: 10, marginTop: 1}}>
                                            <Text style={{width: '10%'}}></Text>
                                            <Text style={{marginVertical: 1, fontStyle: 'italic', fontSize: 13, color: 'gray', width: '70%'}}>Special instructions: {addon["instructions"]}</Text>
                                            </View>
                                        )
                                    } else{
                                        if (addon["required"]===true){
                                            return(
                                                <View key = {j} style={{flexDirection: 'row', marginRight: 10}}>
                                                <Text style={{width: '10%'}}></Text>
                                                <Text style={{marginVertical: 1, fontSize: 13, color: 'gray', width: '70%'}}>{addon["choice"]}</Text>
                                                {Number(addon["price"])>0 ? <Text style={{marginVertical: 1, fontSize: 13, color: 'gray', width: '20%', textAlign: 'right'}}>{authContext.rounded(Number(addon["price"])).toFixed(2)}</Text> : null}
                                                </View>
                                            )
                                        } else{
                                            return(
                                            <View key = {j} >
                                                <View style={{flexDirection: 'row', marginRight: 10}}>
                                                    <Text style={{width: '10%'}}></Text>
                                                    <Text style={{marginVertical: 1, fontSize: 13, color: 'gray'}}>+ </Text>
                                                    <Text style={{marginVertical: 1, fontSize: 13, color: 'gray', width: '70%'}}>{addon["choice"]} (x{addon["quantity"]})</Text>
                                                    {Number(addon["price"])>0 ? <Text style={{marginVertical: 1, fontSize: 13, color: 'gray', width: '20%', textAlign: 'right'}}>+ ${authContext.rounded(Number(addon["price"])*Number(addon["quantity"])).toFixed(2)}</Text> : null}
                                                </View>
                                            </View>
                                        )
                                        }
                                        
                                    }
                                })}

                                {addons[i].length === 0 ? 
                                    <View style={{flexDirection: 'row', marginRight: 10}}>
                                        <Text style={{width: '10%'}}></Text>
                                        <Text style={{marginVertical: 1, fontSize: 13, color: 'gray', width: '90%'}}>No addons or special instructions.</Text> 
                                    </View> : null}

                                
                                
                                
                                
                                
                                
                            </View>

                        </View>
                    )
                })}
                <View style={{borderBottomWidth: 1, borderBottomColor: 'gray', marginHorizontal: 30}}>
                </View>
                <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 30, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', color: 'gray'}}>Subtotal </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 30, fontWeight: 'bold', color: 'gray'}}>${authContext.rounded(route.params.order["subtotal"]).toFixed(2)}</Text>
                </View>

                {Number(route.params.order["discount"]) > 0 ? <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 10, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', color: 'green'}}>Discount </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 10, color: 'green', fontWeight: 'bold'}}>- ${authContext.rounded(Number(route.params.order["discount"])).toFixed(2)}</Text>
                </View> : null}

                

                <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 20, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', color: 'gray'}}>Taxes </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 20, fontWeight: 'bold', color: 'gray'}}>${authContext.rounded(route.params.order["taxes"]).toFixed(2)}</Text>
                </View>

                <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 20, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', color: 'gray'}}>Service fee </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 20, fontWeight: 'bold', color: 'gray'}}>${authContext.rounded(Number(route.params.order["service_fee"]) + Number(route.params.order["extraStripeCharge"])).toFixed(2)}</Text>
                </View>

                <View style={{flexDirection: 'row', paddingVertical: 2, paddingTop: 20, marginHorizontal: 30}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', color: 'gray'}}>Tip </Text>
                    <Text style={{fontSize: 15, position: 'absolute', right: 0, marginTop: 20, fontWeight: 'bold', color: 'gray'}}>${authContext.rounded(route.params.order["tip"]).toFixed(2)}</Text>
                </View>

                <View style={{borderBottomWidth: 1, borderBottomColor: 'gray', marginHorizontal: 30, marginTop: 20}}>
                </View>


                <View style={{flexDirection: 'row', paddingVertical: 5, paddingTop: 20, marginHorizontal: 30}}>
                    <Text style={{fontSize: 17, fontWeight: 'bold'}}>Total </Text>
                    <Text style={{fontSize: 17, position: 'absolute', right: 0, marginTop: 20, fontWeight: 'bold'}}>${(authContext.rounded((route.params.order["subtotal"]))-authContext.rounded(Number(route.params.order["discount"])).toFixed(2)+authContext.rounded(route.params.order["tip"])+authContext.rounded(route.params.order["taxes"])+authContext.rounded(Number(route.params.order["service_fee"]) + Number(route.params.order["extraStripeCharge"]))).toFixed(2)}</Text>
                </View>

                

                <View style={{height: 200}}></View>


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