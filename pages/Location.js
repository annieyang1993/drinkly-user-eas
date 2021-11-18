import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Switch, Modal, ScrollView, TouchableOpacity, StyleSheet, Text, View, Dimensions} from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import InputField from '../components/InputField'

export default function PersonalInformation({navigation}){
    const authContext = useContext(AuthContext);
    const auth = Firebase.auth();
     const toggleSwitch = () => {
         if (authContext.locationSet===true){
             authContext.setLocationSet(!authContext.locationSet)
         } else{
             authContext.getLocation();
         }
         
     }

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{height: '100%', width: '100%'}}>

                <View style={{flexDirection: 'row', width: '90%', alignSelf: 'center', marginTop: 50}}>

                <Text style={{fontWeight: 'bold', fontSize: 18}}>Location permissions</Text>
                <View style={{position: 'absolute', right: 0}}>
                <Switch
                    trackColor={{ false: "#767577", true: "#8fd7dc" }}
                    thumbColor={authContext.locationSet ? "#44bec6" : "#f4f3f4"}
                    onValueChange={()=>toggleSwitch()}
                    value={authContext.locationSet}
                />
                <Text style={{alignSelf: 'center', marginTop: 5, color: 'gray'}}>{authContext.locationSet ? "On" : "Off"}</Text>

                </View>

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