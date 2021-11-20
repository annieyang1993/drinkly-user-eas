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
import PaymentMethods from '../pages/PaymentsList'

export default function CartNavigation({route}){
    const Stack = createStackNavigator();
    const authContext = useContext(AuthContext);

    return(
        <NavigationContainer independent={true}>
            <View style={{height: Dimensions.get("screen").height, width: '100%'}}>
                <Stack.Navigator  screenOptions={{headerShown: false}}>
                    <Stack.Screen style={{backgroundColor: 'white'}} cardStyle='white' name="Cart" options={{title: ""}} component={Cart} options={{headerShown: false, animationEnabled: false,  backgroundColor: 'white'}}/>
                    <Stack.Screen style={{backgroundColor: 'white'}} cardStyle='white' name="Cart Restaurant Page" options={{title: ""}} component={CartRestaurantPage} options={{headerShown: false}}/>
                    <Stack.Screen style={{backgroundColor: 'white'}} cardStyle='white' name="Checkout" options={{title: ""}} component={Checkout} options={{headerShown: false}}/>            
                </Stack.Navigator>
            </View>
        </NavigationContainer>
    )
}