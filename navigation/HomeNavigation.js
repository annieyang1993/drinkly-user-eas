import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import {createStackNavigator} from '@react-navigation/stack'
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native'
import AuthContext from '../context/Context'
import HomePage from '../pages/HomePage'
import RestaurantPage from '../pages/RestaurantModal'

export default function HomeNavigation(){
    const Stack = createStackNavigator();
    const authContext = useContext(AuthContext);
    const restaurantList = Object.values(authContext.restaurants);


    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%'}}>
            <Stack.Navigator  screenOptions={{headerShown: false}}>
                <Stack.Screen  cardStyle='white' name="Home Page" options={{title: ""}} component={HomePage} options={{headerShown: false}}/>
                <Stack.Screen  cardStyle='white' name="Restaurant Page" options={{title: ""}} component={RestaurantPage} options={{headerShown: false}}/>
            </Stack.Navigator>
        </View>
    )
}


