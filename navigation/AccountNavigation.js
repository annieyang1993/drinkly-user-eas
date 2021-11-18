import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {Firebase, db} from '../config/firebase';
import AuthContext from '../context/Context';
import {createStackNavigator} from '@react-navigation/stack'

import AccountPage from '../pages/AccountPage'
import PersonalInformation from '../pages/PersonalInformation'
import Location from '../pages/Location'
import Payments from '../components/Payments'

export default function OrderNavigation(){
    const authContext = useContext(AuthContext);
    const Stack = createStackNavigator();

    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%'}}>
        <Stack.Navigator  screenOptions={{headerShown: false}}>
            <Stack.Screen  cardStyle='white' name="Account Page" options={{title: ""}} component={AccountPage}
            options={{headerShown: false}}/>
            <Stack.Screen style={{backgroundColor: 'white'}} name="Personal Information" component={PersonalInformation} options={{ title: "", headerTintColor: '#545555', headerStyle: {backgroundColor: '#f0f0f0'}, backgroundColor: 'white'}}/>
            <Stack.Screen style={{backgroundColor: 'white'}} name="Location" component={Location} options={{ title: "", headerTintColor: '#545555', headerStyle: {backgroundColor: '#f0f0f0'}, backgroundColor: 'white'}}/>
            <Stack.Screen style={{backgroundColor: 'white'}} name="Payments" component={Payments} options={{ title: "", headerTintColor: '#545555', headerStyle: {backgroundColor: '#f0f0f0'}, backgroundColor: 'white'}}/>
        </Stack.Navigator>
        </View> 
    )
}