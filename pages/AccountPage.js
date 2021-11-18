import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import {Firebase, db} from '../config/firebase';



global.addEventListener = () => {};
global.removeEventListener = () => {};



const auth = Firebase.auth();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
    }
  };

export default function AccountPage({navigation}){
    return(

      <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: 30, marginHorizontal: 10, marginTop: 0}}>Account</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: 'white', height: '100%', width: '95%', alignSelf: 'center'}}>

              <View style={{height: 100, borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 50}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 40}}>
                  <View>
                    <Text style={{fontWeight: 'bold', fontSize: 15}}>Drinkly Cash</Text>
                    <Text style={{fontSize: 12, color: 'gray'}}>Get $0 service fees with Drinkly Cash</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                </TouchableOpacity>
              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}} onPress={()=>{navigation.navigate("Personal Information")}}>
                  <View>
                    <Text style={{fontWeight: '500'}}>Personal Information</Text>
                    <Text style={{fontSize: 11, color: 'gray'}}>Edit your account information</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                </TouchableOpacity>
              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}}>
                  <View>
                  <Text style={{fontWeight: '500'}}>Payment</Text>
                  <Text style={{fontSize: 11, color: 'gray'}}>Edit your payment methods and manage Drinkly Cash</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                </TouchableOpacity>

              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}} onPress={()=>{navigation.navigate("Location")}}>
                  <View>
                  <Text style={{fontWeight: '500'}}>Location</Text>
                  <Text style={{fontSize: 11, color: 'gray'}}>Update your location settings</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                 </TouchableOpacity>
              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}}>
                  <View>
                  <Text style={{fontWeight: '500'}}>Notifications</Text>
                  <Text style={{fontSize: 11, color: 'gray'}}>Update your notification settings</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                 </TouchableOpacity>
              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 25}} onPress={()=>{handleSignOut()}}>
                  <Text style={{fontWeight: '500'}}>Logout</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                 </TouchableOpacity>
              </View>

            
            </ScrollView>

            </View>
        </View> 
        
    )

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
