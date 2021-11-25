import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Switch, Modal, ScrollView, TouchableOpacity, StyleSheet, Text, View, Dimensions} from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import InputField from '../components/InputField'
import * as Location from 'expo-location';

export default function PersonalInformation({navigation}){
    const authContext = useContext(AuthContext);
    const auth = Firebase.auth();
     const toggleSwitch = async () => {
         if (authContext.locationSet===true){
             authContext.setLocationSet(!authContext.locationSet)
             authContext.setLocation();
             authContext.setUserCity();
             authContext.setUserCountry();
             //authContext.setRestaurants({});
         } else{
             //authContext.setLocationSet(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                authContext.setLocationSet(false);
                
                return;
            } else{
                let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
                await authContext.setLocation(location)
                await authContext.setLocationSet(true);
                const loc = await Location.reverseGeocodeAsync(location["coords"]).then((loc)=>{
                    //authContext.getRestaurants(loc[0]["city"], loc[0]["country"]);
                    authContext.setUserCity(loc[0]["city"]);
                    authContext.setUserCountry(loc[0]["country"]);
                });
                
                
            }
         }
         
     }

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{height: '100%', width: '100%'}}>

                <View style={{width: '90%', alignSelf: 'center', marginTop: 50}}>

                <Text style={{fontWeight: 'bold', fontSize: 18}}>Location permissions</Text>
                <Text style={{color: 'gray', fontSize: 14, fontWeight: '500'}}>This app requires location settings to search for nearby cafes. Please go to your app settings to turn on location services.</Text>
                <TouchableOpacity style={{marginTop: 50, alignSelf: 'center', padding: 10, paddingHorizontal: 20, backgroundColor: '#119aa3', borderRadius: 5, shadowColor: 'black', 
                    shadowOffset: {width: 1, height: 1}, 
                    shadowRadius: 2, 
                    shadowOpacity: 0.6}} onPress={()=>Linking.openURL('app-settings:')}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>
                        Settings
                    </Text>
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
             <Text style={{fontWeight: 'bold', fontSize: 18, marginLeft: 10}}>Location</Text>
            
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