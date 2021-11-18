import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import {createStackNavigator} from '@react-navigation/stack'
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native'
import AuthContext from '../context/Context'
import RestaurantPage from '../pages/RestaurantModal'
import Search from '../pages/Search'
import Cart from '../components/Cart'
import CartRestaurantPage from '../pages/CartRestaurantModal'
import Checkout from '../components/Checkout'
import CartNavigation from './CartNavigation'

export default function SearchNavigation(){
    const Stack = createStackNavigator();
    const authContext = useContext(AuthContext);
    const restaurantList = Object.values(authContext.restaurants);


    return(
            <View style={{height: Dimensions.get("screen").height, width: '100%'}}>
            <Stack.Navigator  screenOptions={{headerShown: false}}>
                <Stack.Screen  cardStyle='white' name="Search2" options={{title: ""}} component={Search}
                options={{headerShown: false}}/>
      
            {restaurantList.map((ele, i)=>{
                return(
                <Stack.Screen key={i} style={{backgroundColor: 'white'}} name={String(ele["name"])} component={RestaurantPage} options={{ title: "", headerTintColor: '#545555', headerStyle: {backgroundColor: '#f0f0f0'}, backgroundColor: 'white'}}/>)
            })}
            </Stack.Navigator>
            </View>
    )
}


