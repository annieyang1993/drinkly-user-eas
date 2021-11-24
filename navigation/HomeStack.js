import React, { useContext, useState, useMemo, useEffect} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import {AppState, SafeAreaView, Modal, StyleSheet, Text, View, Button as RNButton, TouchableOpacity, Dimensions, AppStateStatus } from 'react-native';
import 'firebase/firestore'
import AuthContext from '../context/Context'
import Geocoder from 'react-native-geocoding';
import * as Location from 'expo-location';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {doc, setDoc} from 'firebase/firestore'
import {Firebase, db} from '../config/firebase';
import firebase from 'firebase'
import Cart from '../components/Cart'
import Checkout from '../components/Checkout'
import Payments from '../components/Payments'
import Receipt from '../components/Receipt'
import CartRestaurantPage from '../pages/CartRestaurantModal'
import CreditCard from '../components/CardPage'
import DrinklyCash from '../components/DrinklyCash'

//Navigators
import HomeNavigation from './HomeNavigation'
import PointsNavigation from './PointsNavigation'
import SearchNavigation from './SearchNavigation'
import OrderNavigation from './OrderNavigation'
import AccountNavigation from './AccountNavigation'
import PaymentMethods from '../pages/PaymentsList'
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

global.addEventListener = () => {};
global.removeEventListener = () => {};



const auth = Firebase.auth();


function TabNavigator(){
  return (
         <View style={{height: Dimensions.get("screen").height}}>
            <Tab.Navigator
                independent={true}
                activeBackgroundColor='red'
                initialRouteName='Search'
                screenOptions={{
                tintColor: 'red',
                activeColor: 'red',
                activeTintcolor: 'white',
                inactiveBackgroundColor: 'blue',
                inactiveTintColor: 'black',
                safeAreaInsets: {
                    bottom: 0,
                    top: 0
                },
                tabBarActiveTintColor:'#119aa3',
                headerShown: false
                }}>
                
                <Tab.Screen 
                    name="Home" 
                    component={HomeNavigation}
                    options={{headerMode: 'none', tabBarIcon: ({size, color})=> <MaterialCommunityIcons size={20} name="home" color={color}/>}}/>
                <Tab.Screen 
                    name="Points" 
                    component={PointsNavigation}
                    options={{headerMode: 'none', tabBarIcon: ({size, color})=> <MaterialCommunityIcons size={20} name="star" color={color}/>}}/>
                <Tab.Screen 
                    name="Search" 
                    component={SearchNavigation}
                    options={{headerMode: 'none', tabBarIcon: ({size, color})=> <MaterialCommunityIcons size={20} name="magnify" color={color}/>}}/>
                <Tab.Screen 
                    name="Orders" 
                    component={OrderNavigation}
                    options={{headerMode: 'none', tabBarIcon: ({size, color})=> <MaterialCommunityIcons size={20} name="receipt" color={color}/>}}/>
                <Tab.Screen 
                    name="Account" 
                    component={AccountNavigation}
                    options={{headerMode: 'none', tabBarIcon: ({size, color})=> <MaterialCommunityIcons size={20} name="account" color={color}/>}}/>
            </Tab.Navigator>

            </View>

    )
}


export default function HomeStack(){
    const { user } = useContext(AuthenticatedUserContext);
    const [cart, updateCart] = useState([]);
    const [cartRestaurant, updateCartRestaurant] = useState();
    const [subtotal, setSubtotal] = useState(0);
    const [location, setLocation] = useState();
    const [locationSet, setLocationSet] = useState(false);
    const [restaurants, setRestaurants] = React.useState({});
    const [paymentCards, setPaymentCards] = React.useState([]);
    const [defaultCard, setDefaultCard] = React.useState();
    const [stripeCustomerId, setStripeCustomerId] = React.useState();
    const [cartRestaurantItems, setCartRestaurantItems] = useState({});
    const [editItem, setEditItem] = useState(false)
    const [cartModal, setCartModal] = React.useState(false);
    const [paymentModal, setPaymentModal] = React.useState(false);
    const [receiptModal, setReceiptModal] = React.useState(false);
    const [creditCardModal, setCreditCardModal] = React.useState(false);
    const [userData, setUserData] = useState({});

    const [itemTotals, setItemTotals] = useState([])
    const [weekDayArray, setWeekDayArray] = useState(['Today'])
    const [dateTimeArray, setDateTimeArray] = useState({})
    const [cartRestaurantHours, setCartRestaurantHours] = useState({})
    const [beforeOpen, setBeforeOpen] = useState(false);
    const [afterClose, setAfterClose] = useState(false);
    const [cartSubTotal, setCartSubTotal] = useState(0);
    const [prevScreen, setPrevScreen] = useState('')
    const [prevScreenParams, setPrevScreenParams] = useState({})
    const [cartNumber, setCartNumber] = useState(0)
    const [userCity, setUserCity] = useState();
    const [userCountry, setUserCountry] = useState();
    
    
    const [drinklyCash, setDrinklyCash] = useState(false);
    const [drinklyCashAmount, setDrinklyCashAmount] = useState(0);
    const [dayIndex, setDayIndex] = useState(0);
    const [timeIndex, setTimeIndex] = useState(0);
    const [orderList, setOrderList] = useState([])
    const [pointsList, setPointsList] = useState({});
    const [search, setSearch] = useState('')
    const [discounts, setDiscounts] = useState({})
    const [savedRestaurants, setSavedRestaurants] = useState([]);
    const [savedRestaurantsObject, setSavedRestaurantsObject] = useState({});
    const [quickCheckoutList, setQuickCheckoutList] = useState([])
    const [quickCheckoutObject, setQuickCheckoutObject] = useState({})
    const [discountCode, setDiscountCode] = useState('')
    const [discount,setDiscount] = useState(0)
    const [cartBool, setCartBool] = useState(false);
    const [rewards, setRewards] = useState({});
    const [rewardsArray, setRewardsArray] = useState([]);

    
    const [tip, setTip] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([])
    const [defaultPaymentId, setDefaultPaymentId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(drinklyCashAmount===undefined || drinklyCashAmount < cartSubTotal || drinklyCash === false ? (defaultPaymentId=== undefined ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
    const [icon, setIcon] = useState(drinklyCashAmount===undefined || drinklyCashAmount < (cartSubTotal) || drinklyCash === false ? (defaultPaymentId === undefined ? '' : 'credit-card') : 'cash')
    const [taxes, setTaxes] = useState(0);
    const [serviceFee, setServiceFee] = useState(paymentMethod === 'Drinkly Cash' ? 0 : 0.15);
    const tipsArray = ['No tip', '5%', '10%', '15%', '18%'];
    const [tipIndex, setTipIndex] = useState(1)
    const navigation = useNavigation();
    const Stack = createStackNavigator();


    const [appState, setAppState] = useState(AppState.currentState);


    const getRestaurants = async () =>{ 
        const userDataTemp = await getUser();
        const collect = await Firebase.firestore().collection('restaurants').get();
        var tempList = {}
        const savedRestaurantsTemp = [];
        const savedRestaurantsObjectTemp = {};
        await collect.docs.map((doc, i)=>{
            tempList[i] = doc.data();   
                    
            if (userDataTemp["saved"]!==undefined){
                if (userDataTemp["saved"].includes(doc.id)){
                    savedRestaurantsTemp.push(doc.id);
                    savedRestaurantsObjectTemp[doc.id] = doc.data();
                }              
            }

        })
        setRestaurants(tempList); 
        

        const quickCheckout = await Firebase.firestore().collection('users').doc(user.uid).collection('quick_checkout').orderBy('created_at', 'desc').limit(4).get();
        const quickCheckoutObjectTemp = {}
        quickCheckout.docs.map((quickItem, j)=>{
            quickCheckoutObjectTemp[quickItem.id] = quickItem.data()

        })
        setQuickCheckoutObject(quickCheckoutObjectTemp);
        setQuickCheckoutList(Object.keys(quickCheckoutObjectTemp));
        setSavedRestaurants(savedRestaurantsTemp);
        setSavedRestaurantsObject(savedRestaurantsObjectTemp);

    }

    const getPayments = async () => {
        const paymentsTemp = await Firebase.firestore().collection('users').doc(user.uid).collection('payment_methods').get();
        const paymentsTempArray = []
        paymentsTemp.docs.map((payment, i)=>{
            paymentsTempArray.push(payment.data());
        })
        await setPaymentMethods(paymentsTempArray);
    }

    const getRewards = async () =>{
        const rewardsFirebase = await Firebase.firestore().collection('users').doc(user.uid).collection('rewards').get();
        const rewardsTemp = {};
        const rewardsArrayTemp = [];
        rewardsFirebase.docs.map((reward, i)=>{
            rewardsTemp[reward.id] = reward.data();
            rewardsArrayTemp.push(reward.id);
        })

        setRewards(rewardsTemp);
        setRewardsArray(rewardsArrayTemp);

    }



    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLocationSet(false);
            setLocation();
            setUserCity();
            setUserCountry();
            return;
        } else{
            let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
            setLocation(location);
            setLocationSet(true);
            const loc = await Location.reverseGeocodeAsync(location["coords"]).then((loc)=>{
                setUserCity(loc[0]["city"]);
                setUserCountry(loc[0]["country"]);
            });
            
        }
    }

    const getLocationSecond = async () => {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLocationSet(false);
            setLocation();
            setUserCity();
            setUserCountry();
            return;
        } else{
            let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
            setLocation(location);
            setLocationSet(true);
            const loc = await Location.reverseGeocodeAsync(location["coords"]).then((loc)=>{
                setUserCity(loc[0]["city"]);
                setUserCountry(loc[0]["country"]);
            });
            
        }
    }

    const getUser = async () =>{
        const userTemp = await Firebase.firestore().collection('users').doc(user.uid).get()
        setUserData(userTemp.data());
        setDefaultPaymentId(userTemp.data().default_payment_id===undefined || userTemp.data().default_payment_id===null ? '' : userTemp.data().default_payment_id);
        setDrinklyCashAmount(userTemp.data().drinkly_cash===undefined || userTemp.data().drinkly_cash===null ? 0 : userTemp.data().drinkly_cash);
        setDrinklyCash(userTemp.data().drinkly_bool);
        return userTemp.data();
        
    }

    const getSaved = async () => {
        const saved = Firebase.firestore().collection('users').doc(user.uid).collection()
    }

    const getPoints = async () =>{
        const tempPoints = {};
        const points = await Firebase.firestore().collection('users')
                                .doc(`${user.uid}`)
                                .collection('points').orderBy('cummulative_points', 'desc').get()
        points.docs.map((pointCard, i)=>{
            const pointsInfo = pointCard.data();
            tempPoints[pointsInfo["restaurant_id"]]=pointsInfo;
        })

        setPointsList(tempPoints);
    }

    const getOrders = async()=>{
        const tempOrders = []
        const orders = await Firebase.firestore().collection('users')
                                .doc(`${user.uid}`)
                                .collection('orders').orderBy('created_at', 'desc').limit(10).get()
        orders.docs.map((order, i)=>{
            tempOrders.push(order.data());
        })

        setOrderList(tempOrders);            
    }

    // const getDiscounts = async () =>{
    //     const tempDiscounts = [];
    //     const discounts = await Firebase.firestore().collection('users')
    //                                 .doc(`${user.uid}`)
    //                                 .collection('discounts').get();
    //     discounts.docs.map(async (discount, i)=>{
    //         if (discount.data().expires_at < new Date()){
    //             await delete(discount);
    //         } else{
    //             tempDiscounts.push(discount.data().code)
    //         }
    //     })
    // }

    useEffect(async ()=>{
        Geocoder.init("AIzaSyB9fx4NpEW1D65AvgJjzY-npVoFUf17FRg");
        getLocation();
        getRestaurants();
        getOrders();
        getPoints();
        getPayments();
        getRewards();




        // Firebase.firestore().collection('cafes').doc('cafes').collection('Toronto, Canada').doc('Dineen Coffee Co.-140 Yonge St-Toronto').set({
        //     city: 'Toronto',
        //     country: 'Canada',
        //     description: 'Polished cafe bordered by a red leather banquet serves sandwiches & bakery fare in a historic space.',
        //     email: 'dineen@gmail.com',
        //     latitude: 42.9204342,
        //     longitude: -83.4491537,
        //     name: 'Dineen Coffee Co.',
        //     phone: '000',
        //     pictures: ['https://s3-media0.fl.yelpcdn.com/bphoto/Gcra-6PJtd6nXPIi4ubmmQ/o.jpg', 'https://s3-media0.fl.yelpcdn.com/bphoto/22vrxn15kvMsx2_v-s-dQQ/o.jpg'],
        //     price_level: 3,
        //     sections: ['Espresso Drinks', 'Drip Coffee & Tea', 'Iced Drinks', 'Breakfast Cups'],
        //     state: 'Ontario',
        //     street: ['140 Yonge St'],
        //     restaurant_id: 'Dineen Coffee Co.-140 Yonge St-Toronto',
        //     max_points: 10,
        //     max_reward_cost: 5,
        //     points_per_purchase: 1,
        //     preward_type: 'Drink',
        //     rewards: true,
        //     rewards_card_pic: 'https://s3-media0.fl.yelpcdn.com/bphoto/Gcra-6PJtd6nXPIi4ubmmQ/o.jpg'
        // })

        // Firebase.firestore().collection('cafes').doc('cafes').collection('Toronto, Canada').doc('Fahrenheit Coffee-120 Lombard St-Toronto').set({
        //     city: 'Toronto',
        //     country: 'Canada',
        //     description: 'Specialty coffee drinks made with house-roasted beans are poured, plus light fare & baked goods.',
        //     email: 'fahrenheit@gmail.com',
        //     latitude: 43.6524129,
        //     longitude: -79.3751237,
        //     name: 'Fahrenheit Coffee',
        //     phone: '000',
        //     pictures: ['https://s3-media0.fl.yelpcdn.com/bphoto/EY6INMS7hD51lBg8U6BYZA/o.jpg', 'https://s3-media0.fl.yelpcdn.com/bphoto/G0qtDI4vD1aQk1zlPkhA5w/o.jpg'],
        //     price_level: 2,
        //     sections: ['Espresso', 'Hot Drinks'],
        //     state: 'Ontario',
        //     street: ['120 Lombard St'],
        //     max_points: 10,
        //     max_reward_cost: 5,
        //     points_per_purchase: 1,
        //     preward_type: 'Drink',
        //     rewards: true,
        //     rewards_card_pic: 'https://s3-media0.fl.yelpcdn.com/bphoto/Gcra-6PJtd6nXPIi4ubmmQ/o.jpg',
        //     restaurant_id: 'Fahrenheit Coffee-120 Lombard St-Toronto',
        // })

        // const isThere = await Firebase.firestore().collection('cafes').doc('cafes').collection('Toronto, United States').get();
        // console.log(isThere.docs)

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('operating hours')
        // .doc('Monday').set({open: '6:30 am', close: '6:30 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('operating hours')
        // .doc('Tuesday').set({open: '6:30 am', close: '6:30 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('operating hours')
        // .doc('Wednesday').set({open: '6:30 am', close: '6:30 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('operating hours')
        // .doc('Thursday').set({open: '6:30 am', close: '6:30 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('operating hours')
        // .doc('Friday').set({open: '6:30 am', close: '6:30 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('operating hours')
        // .doc('Saturday').set({open: '8:30 am', close: '6:30 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('operating hours')
        // .doc('Sunday').set({open: '8:30 am', close: '6:30 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Americano')
        // .set({
        //     name: 'Americano',
        //     price: 3.25,
        //     section: 'Espresso Drinks',
        //     description: 'Double shot of espresso with hot water.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Espresso')
        // .set({
        //     name: 'Espresso',
        //     price: 2,
        //     section: 'Espresso Drinks',
        //     description: 'The Temperance Blend has a creamy mouth feel, is full bodied, sweet & balanced.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Americano Misto')
        // .set({
        //     name: 'Americano Misto',
        //     price: 3.85,
        //     section: 'Espresso Drinks',
        //     description: 'Double shot of espresso with hot water & a dollop of steamed milk.',
        // })


        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Latte')
        // .set({
        //     name: 'Latte',
        //     price: 4.35,
        //     section: 'Espresso Drinks',
        //     description: 'Two shots of espresso, steamed milk & a layer of foam on top. The classic milk & espresso drink.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Flat White')
        // .set({
        //     name: 'Flat White',
        //     price: 3.60,
        //     section: 'Espresso Drinks',
        //     description: 'Double shot of espresso with fresh, steamed milk poured over it. Perfect for those who like a latte with a little less foam.',
        // })

        // /////////

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Temperance Brew')
        // .set({
        //     name: 'Temperance Brew',
        //     price: 2.50,
        //     section: 'Drip Coffee & Tea',
        //     description: 'The temperance blend has a creamy mouth feel, is full bodied, sweet & balanced. Self serve milk station at pickup.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Red Eye')
        // .set({
        //     name: 'Red Eye',
        //     price: 3.50,
        //     section: 'Drip Coffee & Tea',
        //     description: 'Brew coffee with a shot of espresso.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Chai Latte')
        // .set({
        //     name: 'Chai Latte',
        //     price: 4.35,
        //     section: 'Drip Coffee & Tea',
        //     description: 'Aromatic spiced black tea blended with steamed milk, flavoured with house made chai syrup.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('London Fog')
        // .set({
        //     name: 'London Fog',
        //     price: 4.35,
        //     section: 'Drip Coffee & Tea',
        //     description: 'Earl Grey tea with steamed milk & housemade vanilla syrup.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Iced Americano')
        // .set({
        //     name: 'Iced Americano',
        //     price: 4.35,
        //     section: 'Iced Drinks',
        //     description: 'Double shot of espresso with cold water over ice.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Iced Latte')
        // .set({
        //     name: 'Iced Latte',
        //     price: 4.45,
        //     section: 'Iced Drinks',
        //     description: 'Two shots of espresso and milk on top over ice. The classic milk & espresso drink.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Iced Mocha')
        // .set({
        //     name: 'Iced Mocha',
        //     price: 5.15,
        //     section: 'Iced Drinks',
        //     description: 'Espresso & dark chocolate ganache with milk over ice.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Iced Vanilla Latte')
        // .set({
        //     name: 'Iced Vanilla Latte',
        //     price: 4.75,
        //     section: 'Iced Drinks',
        //     description: 'Espresso & housemade vanilla syrup with milk over ice.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Greek Yogurt Parfait')
        // .set({
        //     name: 'Greek Yogurt Parfait',
        //     price: 4.29,
        //     section: 'Breakfast Cups',
        //     description: 'With Banana Bread Granola & Fresh Berries.',
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Dineen Coffee Co.-140 Yonge St-Toronto')
        // .collection('items')
        // .doc('Coconut Chia, Pineapple & Granola')
        // .set({
        //     name: 'Coconut Chia, Pineapple & Granola',
        //     price: 4.29,
        //     section: 'Breakfast Cups',
        // })

        

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('operating hours')
        // .doc('Monday').set({open: '7:00 am', close: '4:00 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('operating hours')
        // .doc('Tuesday').set({open: '7:00 am', close: '4:00 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('operating hours')
        // .doc('Wednesday').set({open: '7:00 am', close: '4:00 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('operating hours')
        // .doc('Thursday').set({open: '7:00 am', close: '4:00 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('operating hours')
        // .doc('Friday').set({open: '7:00 am', close: '4:00 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('operating hours')
        // .doc('Saturday').set({open: '8:00 am', close: '4:00 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('operating hours')
        // .doc('Sunday').set({open: '9:00 am', close: '3:00 pm'})

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('items')
        // .doc('Cortado')
        // .set({
        //     name: 'Cortado',
        //     price: 4.95,
        //     section: 'Espresso',
        //     img: 'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1920,format=auto,quality=50/https://cdn.doordash.com/media/photos/0a71b6c1-0cc0-4094-a8d4-f0dcc12e1f38-retina-large.jpg',
        //     description: 'Smooth espresso based drink with roughly equal amounts of steamed milk. 70 Cal.'
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('items')
        // .doc('Mocha')
        // .set({
        //     name: 'Mocha',
        //     price: 4.95,
        //     section: 'Espresso',
        //     img: 'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1920,format=auto,quality=50/https://cdn.doordash.com/media/photos/1302768a-568c-4b99-96e5-d8d444aea51f-retina-large.jpg',
        //     description: `Espresso, chunks of premium milk chocolate, steamed milk, cocoa. Don't forget to stir, there is real chocolate at the bottom! 220-560 Cal.`
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('items')
        // .doc('Loose Leaf Tea')
        // .set({
        //     name: 'Loose Leaf Tea',
        //     price: 3.05,
        //     section: 'Hot Drinks',
        //     img: 'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1920,format=auto,quality=50/https://cdn.doordash.com/media/photos/13cedfee-0a21-4a5d-822f-b43ee8487554-retina-large-jpeg',
        //     description: `0 Cal.`
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('items')
        // .doc('Ginger Turmeric')
        // .set({
        //     name: 'Ginger Turmeric',
        //     price: 5.95,
        //     section: 'Hot Drinks',
        //     img: 'https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1920,format=auto,quality=50/https://cdn.doordash.com/media/photos/39144c8a-9318-4aeb-95b9-5cba582a88f4-retina-large-jpegCold-pressed juice with a hint of honey, lemon & cinnamon (Small - 12 oz) 50 cals',
        //     description: `Cold-pressed juice with a hint of honey, lemon & cinnamon (Small - 12 oz) 50 cals.`
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('items')
        // .doc('Hot Chocolate')
        // .set({
        //     name: 'Hot Chocolate',
        //     price: 5.65,
        //     section: 'Hot Drinks',
        //     description: `Chunks of premium milk chocolate, steamed milk, cocoa. Be sure to stir, there is real chocolate at the bottom! 300-800 Cal.`
        // })

        // Firebase.firestore()
        // .collection('cafes').doc('cafes').collection('Toronto, Canada')
        // .doc('Fahrenheit Coffee-120 Lombard St-Toronto')
        // .collection('items')
        // .doc('Chai Latte')
        // .set({
        //     name: 'Chai Latte',
        //     price: 5.25,
        //     section: 'Hot Drinks',
        //     description: `Delicately spiced chai with steamed milk & topped with a sprinkle of cinnamon. 170-460 Cal.`
        // })

    }, [])

    useEffect(async ()=>{
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            setAppState(nextAppState);
        };

        // register the handler to listen for app state changes
        AppState.addEventListener('change', handleAppStateChange);

        // unsubscribe
        return () => AppState.removeEventListener('change', handleAppStateChange);
    }, [])

    useEffect(async ()=>{
        // checks that app state changed to 'active' - user comes back from background or inactive state
        // note -- this will also trigger the first time you enter the screen
        if (appState === 'active') {
            // check location permission
            getLocationSecond();
        }
    }, [appState])

    const config = {
        animation: 'spring',
        config: {
            stiffness: 1000,
            damping: 500,
            mass: 3,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
        },
    };

    const setWeekdayAndTimeArrays = async ()=>{
      setPrevScreen("Points")
      setPrevScreenParams({})
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      var minReadyIn = 10
      var today = new Date().getDay()

    const weekDayArrayTemp = ['Today'];
      ([1,2,3,4]).map((day, i)=>{
          weekDayArrayTemp.push(weekdays[(today+day)%7]);
          
      })

      setWeekDayArray(weekDayArrayTemp)

      var currentTimeIncrement = new Date(new Date().getTime()+minReadyIn*60000)
      var coeff = 1000*60*5;
      var roundUp = new Date(Math.ceil(currentTimeIncrement.getTime()/coeff)*coeff)
      const dateTimeArrayTemp = {}
      var open = cartRestaurantHours[weekdays[today]]["open"]
      var close = cartRestaurantHours[weekdays[today]]["close"]
      var openArray = open.split(' ')[0].split(':')
      var closeArray = close.split(' ')[0].split(':')
      var day = new Date()
      if (openArray.length===1){
        if (open.split(' ')[1]==='pm'){
          day.setHours(Number(openArray[0])+12, 0, 0)
        } else{
          day.setHours(Number(openArray[0]), 0, 0)
        }
      } else{
        if (open.split(' ')[1]==='pm'){
          day.setHours(Number(openArray[0])+12, openArray[1], 0)
        } else{
          day.setHours(Number(openArray[0]), openArray[1], 0)
        }
      }

      var closeDay = new Date()
      if (closeArray.length===1){
        if (close.split(' ')[1]==='pm'){
          closeDay.setHours(Number(closeArray[0])+12, 0, 0)
        } else{
          closeDay.setHours(Number(closeArray[0]), 0, 0)
        }
      } else{
        if (close.split(' ')[1]==='pm'){
          closeDay.setHours(Number(closeArray[0])+12, closeArray[1], 0)
        } else{
          closeDay.setHours(Number(closeArray[0]), closeArray[1], 0)
        }
      }
      var afterClose = false
      if (roundUp.getTime()>closeDay.getTime()){
        setAfterClose(true)
        afterClose = true;
      }

      if (roundUp.getTime()<day.getTime()){
        setBeforeOpen(true)
      }
      weekDayArrayTemp.map((weekday, i)=>{
        var times = []
        var beforeOpen = false
        if (i===0){
          var j = 0;
          if (roundUp.getTime()<day.getTime()){
            roundUp = day;
            beforeOpen = true;
          }
          while(roundUp.getTime()<=closeDay.getTime()){
            if (j===0 && beforeOpen===false){
                times.push(`In ${minReadyIn} mins`);              
            } else if (j===1 && beforeOpen===false){
              times.push(`In ${minReadyIn+10} mins`);
            } else if (j===2 && beforeOpen===false){
              times.push(`In ${minReadyIn+20} mins`);
            } else{
              times.push(roundUp.toLocaleTimeString([], {timeStyle: 'short'}));
            }
            roundUp = new Date(roundUp.getTime()+10*60000);
            j+=1;
          }
          if (afterClose===false){
            dateTimeArrayTemp[weekday] = times;
          
          }
        } else{
            open = cartRestaurantHours[weekday]["open"]
            close = cartRestaurantHours[weekday]["close"]

            openArray = open.split(' ')[0].split(':')
            closeArray = close.split(' ')[0].split(':')
            if (openArray.length===1){
              if (open.split(' ')[1]==='pm'){
                day.setHours(Number(openArray[0])+12, 0, 0)
              } else{
                day.setHours(Number(openArray[0]), 0, 0)
              }
            } else{
              if (open.split(' ')[1]==='pm'){
                day.setHours(Number(openArray[0])+12, openArray[1], 0)
              } else{
                day.setHours(Number(openArray[0]), openArray[1], 0)
              }
            }
            if (closeArray.length===1){
              if (close.split(' ')[1]==='pm'){
                closeDay.setHours(Number(closeArray[0])+12, 0, 0)
              } else{
                closeDay.setHours(Number(closeArray[0]), 0, 0)
              }
            } else{
              if (close.split(' ')[1]==='pm'){
                closeDay.setHours(Number(closeArray[0])+12, closeArray[1], 0)
              } else{
                closeDay.setHours(Number(closeArray[0]), closeArray[1], 0)
              }
            }
            var start = day;
          while (start.getTime()<=closeDay.getTime()){
            times.push(start.toLocaleTimeString([], {timeStyle: 'short'}));
            start = new Date(start.getTime()+10*60000);
          }
          dateTimeArrayTemp[weekday] = times;
        }


      })
      setDateTimeArray(dateTimeArrayTemp);
    }

    const rounded = (number) =>{
        const separated = String(Number(number)).split(".");
        if (separated.length===1){
            return number;
        } else{
            if (separated[1].length<=2){
                return number;
            } else{
                const first = Number(separated[1][0]);
                const second = Number(separated[1][1]);
                const third = Number(separated[1][2]);
                if (Number(third)<5){
                    return Number([separated[0], String(first)+String(second)].join('.'))
                } else{
                    if (second === 9 && first === 9){
                        return Number(separated[0])+1;
                    } else if (second === 9 && first <9){
                        return Number([separated[0], String(first+1)].join('.'))
                    } else if (second < 9){
                        return Number([separated[0], String(first)+String(second+1)].join('.'))
                    }
                        
                }
            }
        }

    }
    

    return(
    <AuthContext.Provider value={{user, cart, updateCart, cartRestaurant, updateCartRestaurant, 
    subtotal, setSubtotal, location, setLocation, getLocation, restaurants, setRestaurants, paymentCards, setPaymentCards, 
    defaultCard, setDefaultCard, cartModal, setCartModal, paymentModal, setPaymentModal, receiptModal, setReceiptModal, 
    creditCardModal, setCreditCardModal, stripeCustomerId, setStripeCustomerId, cartRestaurantItems, setCartRestaurantItems, 
    editItem, setEditItem, itemTotals, setItemTotals, weekDayArray, setWeekDayArray, dateTimeArray, setDateTimeArray,
    cartRestaurantHours, setCartRestaurantHours, beforeOpen, setBeforeOpen, afterClose, setAfterClose,
    cartSubTotal, setCartSubTotal, prevScreen, setPrevScreen, prevScreenParams, setPrevScreenParams, cartNumber, setCartNumber,
    taxes, setTaxes, serviceFee, setServiceFee, drinklyCash, setDrinklyCash, userData, setUserData,
    dayIndex, setDayIndex, timeIndex, setTimeIndex, orderList, setOrderList, pointsList, setPointsList, locationSet, setLocationSet,
    search, setSearch, discounts, setDiscounts, savedRestaurants, setSavedRestaurants, savedRestaurantsObject, setSavedRestaurantsObject,
    quickCheckoutList, setQuickCheckoutList, quickCheckoutObject, setQuickCheckoutObject, tip, setTip, discount, setDiscount, 
    discountCode, setDiscountCode, rounded, paymentMethods, setPaymentMethods, defaultPaymentId, setDefaultPaymentId,
    drinklyCashAmount, setDrinklyCashAmount, paymentMethod, setPaymentMethod, icon, setIcon, tipIndex, setTipIndex, 
    tipsArray, cartBool, setCartBool, userCity, setUserCity, userCountry, setUserCountry, getRestaurants, rewards, setRewards, rewardsArray, setRewardsArray}}>
        <Stack.Navigator style={{height: '90%'}}>
            <Stack.Screen 
                    name="Tabs" 
                    component={TabNavigator}
                    options={{headerMode: 'none', tabBarIcon: ({size, color})=> <MaterialCommunityIcons size={20} name="account" color={color}/>}}/>
            <Stack.Screen name="Cart" component={Cart} options={{headerMode: 'none'}}/>
            <Stack.Screen name="Cart Restaurant Page" component={CartRestaurantPage} options={{headerMode: 'none'}}/>
            <Stack.Screen name="Checkout" component={Checkout} options={{headerMode: 'none'}}/>
            <Stack.Screen name="Add Payment" component={Payments} options={{headerMode: 'none'}}/>
            <Stack.Screen name="Receipt" component={Receipt} options={{headerMode: 'none'}}/>
            <Stack.Screen name="Payment Methods" options={{title: ""}} component={PaymentMethods} options={{headerMode: 'none'}}/>     
            <Stack.Screen name="Credit Card" options={{title: ""}} component={CreditCard} options={{headerMode: 'none'}}/>     
            <Stack.Screen name="Drinkly Cash" options={{title: ""}} component={DrinklyCash} options={{headerMode: 'none'}}/>   

              

        </Stack.Navigator>

        {cart.length=== 0 || cartBool === true ? null : 
        <TouchableOpacity style={{position: 'absolute', bottom: '11%', width: '95%', alignSelf: 'center', paddingVertical: 11, paddingHorizontal: 30, backgroundColor: '#119aa3', borderRadius: 20, textAlign: 'center', shadowColor: 'black', 
                    shadowOffset: {width: 2, height: 2}, 
                    shadowRadius: 3, 
                    shadowOpacity: 0.6}} onPress={()=>setWeekdayAndTimeArrays().then(()=>{navigation.navigate("Cart"); setCartBool(true)})}>
            <View ><Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 16}}>
                <MaterialCommunityIcons name="cart" color='white' size={18} style={{paddingRight: 10}}/>
                {cartRestaurant.restaurant.name} - {cartNumber} item(s)</Text></View>
        </TouchableOpacity> }

        
        

    </AuthContext.Provider>)
    
}

