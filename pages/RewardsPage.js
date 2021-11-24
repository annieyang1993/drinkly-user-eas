import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {Modal, Image, TouchableOpacity, ImageBackground, ScrollView, Dimensions, StyleSheet, Text, View } from 'react-native';
import {Firebase, db} from '../config/firebase';
import ItemModal from '../pages/HomeItemModal'
import AuthContext from '../context/Context'
import { NavigationContainer, useNavigation } from '@react-navigation/native';

//import CachedImage from 'react-native-expo-cached-image'

export default function RewardsPage({route}){
    const authContext = useContext(AuthContext);
    const [itemModal, setItemModal] = useState(false);
    const [item, setItem] = useState({});
    const [selections, setSelections] = useState({});
    const navigation = useNavigation();
    


    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: 'white', height: '100%'}}>
              <MaterialCommunityIcons name="ticket" size={200} color='#44bec6' style={{alignSelf: 'center', marginTop: '20%', opacity: 0.5}}/>
              <Text style={{fontWeight: 'bold', alignSelf: 'center', fontSize: 15}}>Use code {route.params.reward.code}</Text>
              <Text style={{alignSelf: 'center', marginTop: 20}}>On checkout</Text>
              <Text style={{alignSelf: 'center', marginTop: 20}}> For up to ${route.params.reward.max_reward_cost} off your {route.params.reward.reward_type.toLowerCase()}! </Text>
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
             <Text style={{fontWeight: 'bold', fontSize: 18, marginLeft: 10}}>Reward from {route.params.reward.restaurant_name}</Text>
            
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