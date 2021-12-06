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
    const [cartRestaurant, updateCartRestaurant] = useState({});
    const [subtotal, setSubtotal] = useState(0);
    const [location, setLocation] = useState();
    const [locationSet, setLocationSet] = useState(true);
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
    const [extraStripeCharge, setExtraStripeCharge] = useState(0);
    
    
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
    const [discountBool, setDiscountBool] = useState(false);
    const [cartBool, setCartBool] = useState(false);
    const [rewards, setRewards] = useState({});
    const [cartSubTotalDiscount, setCartSubTotalDiscount] = useState(0);
    const [rewardsArray, setRewardsArray] = useState([]);
    const [discountId, setDiscountId] = useState('')
    const [itemsAndAddons, setItemsAndAddons] = useState({});
    const [activeOrder, setActiveOrder] = useState({})

    
    const [tip, setTip] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([])
    const [defaultPaymentId, setDefaultPaymentId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(drinklyCashAmount===undefined || drinklyCashAmount < cartSubTotal || drinklyCash === false ? (defaultPaymentId=== undefined ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
    const [icon, setIcon] = useState(drinklyCashAmount===undefined || drinklyCashAmount < (cartSubTotal) || drinklyCash === false ? (defaultPaymentId === undefined ? '' : 'credit-card') : 'cash')
    const [taxes, setTaxes] = useState(0);
    const [serviceFee, setServiceFee] = useState(paymentMethod === 'Drinkly Cash' ? 0 : 0.15);
    const tipsArray = ['No tip', '5%', '10%', '15%', '18%'];
    const [tipIndex, setTipIndex] = useState(1);
    const [loadingRestaurants, setLoadingRestaurants] = useState(false);;
    const navigation = useNavigation();
    const Stack = createStackNavigator();


    const [appState, setAppState] = useState(AppState.currentState);



    const getRestaurants = async () =>{ 
      await setLoadingRestaurants(true);
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
        await setLoadingRestaurants(false)

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
        const rewardsFirebase = await Firebase.firestore().collection('users').doc(user.uid).collection('rewards').where("used", "==", false).get();
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
            getRestaurants();
            return;
        } else{
            await setLoadingRestaurants(true);
            setLocationSet(true);
            let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
            setLocation(location);
            await getRestaurants();
            const loc = await Location.reverseGeocodeAsync(location["coords"]).then((loc)=>{
                setUserCity(loc[0]["city"]);
                setUserCountry(loc[0]["country"]);
            });
            await setLoadingRestaurants(false);
            
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
          await setLoadingRestaurants(true);
          setLocationSet(true);
            let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
            setLocation(location);
            
            const loc = await Location.reverseGeocodeAsync(location["coords"]).then((loc)=>{
                setUserCity(loc[0]["city"]);
                setUserCountry(loc[0]["country"]);
            });
            await setLoadingRestaurants(false)
            
        }
    }

    const updatePaymentMethod = async (subtotal, tip, taxes, bool, drinklyCashAmountNumber, discount) => {
      const paymentMethodTemp = drinklyCashAmountNumber===undefined || drinklyCashAmountNumber < (subtotal -discount + tip + taxes) || bool === false ? (defaultPaymentId=== undefined || defaultPaymentId === '' ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash';
        await setPaymentMethod(drinklyCashAmountNumber===undefined || drinklyCashAmountNumber < (subtotal -discount + tip + taxes) || bool === false ? (defaultPaymentId=== undefined || defaultPaymentId === ''? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
        await setIcon(drinklyCashAmountNumber===undefined || drinklyCashAmountNumber < (subtotal - discount+ tip + taxes) || bool === false ? (defaultPaymentId=== undefined || defaultPaymentId === ''? '' : 'credit-card') : 'cash')
        if (paymentMethodTemp === 'Drinkly Cash'){
            await setServiceFee(0);
            await setExtraStripeCharge(0);
        } else{
            await setServiceFee(0.15);
            if (paymentMethodTemp === 'Credit card'){
                if (userData.default_payment_country!=='CA'){
                    await setExtraStripeCharge(0.006*(subtotal-discount));
                } else{
                  await setExtraStripeCharge(0);
                }
            } else{
              await setServiceFee(0);
              await setExtraStripeCharge(0);
            }
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
                                .collection('orders').orderBy('created_at', 'desc').limit(10).onSnapshot(async (orders) =>{
        orders.docs.map((order, i)=>{
            tempOrders.push(order.data());
        })
      })

        setOrderList(tempOrders);            
    }

    const handleSubmitDiscount = async (text, cart, subtotal) =>{
        var found = false;
        var index = 0;
        var discountTotal = 0;
      if (cartRestaurant!== undefined){
          rewardsArray.map((reward, i)=>{
              if (rewards[reward]["code"]===text && rewards[reward]["restaurant_id"]===cartRestaurant.info){
                  found = true;
                  index = i;
                  setDiscountId(rewards[reward]["id"]);
              }
          })
      }

        if (text===''){
            setDiscount(0);
            setDiscountCode('')
            setDiscountBool(false);
            setDiscountId('');
        }

        else if (found === true){
            setDiscountBool(true);
            
            if (rewards[rewardsArray[index]]["reward_type"]==="Drink"){
                const {cartIndex, itemprice} = await findLowestPriceIndex(cart);
                if (Number(itemprice)<Number(rewards[rewardsArray[index]]["max_reward_cost"])){
                    setDiscount(itemprice);
                    discountTotal = itemprice;
                } else{
                     setDiscount(Number(rewards[rewardsArray[index]]["max_reward_cost"]));
                     discountTotal = Number(rewards[rewardsArray[index]]["max_reward_cost"]);
                }
            }

            if ((subtotal-discountTotal)<4){
                setTaxes((subtotal-discountTotal)*0.05);
            } else{
                setTaxes((subtotal-discountTotal)*0.13);
            }

            setTip(Number(subtotal)-Number(discountTotal), tipIndex);
            if (rounded(Number(subtotal-Number(discountTotal))) === 0){
                setServiceFee(0);
            }

            
            setDiscountCode(text);

        } else{
            setDiscountBool(false);
            setDiscount(0);
            setDiscountCode('');
            setDiscountId('');
        }

        return(discountTotal);
        
    }

    const findLowestPriceIndex = async (cart) => {
        var index = 0;
        var itemprice = 0;
        cart.map((item, i)=>{
            
            if (i===0){
                itemprice = rounded(Number(item["total_price"])).toFixed(2);
            } else{
                if (rounded(Number(item["total_price"])).toFixed(2)<Number(itemprice)){
                    index = i;
                    itemprice = rounded(Number(item["total_price"])).toFixed(2);
                }
            }

        })
        return {index, itemprice}
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

        
        const unsubscribe = await Firebase.firestore().collection('users')
                                .doc(`${user.uid}`)
                                .collection('orders').orderBy('created_at', 'desc').limit(10).onSnapshot(async (orders) =>{
                                  const tempOrders = []
                              orders.docs.map((order, i)=>{
                                  tempOrders.push(order.data());
                              })
                              setOrderList(tempOrders); 
        })

          
        
        getPoints();
        getPayments();
        getRewards();

    
    return () => {
      unsubscribe();
    }

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
    search, setSearch, discounts, setDiscounts, discountBool, setDiscountBool, savedRestaurants, setSavedRestaurants, savedRestaurantsObject, setSavedRestaurantsObject,
    quickCheckoutList, setQuickCheckoutList, quickCheckoutObject, setQuickCheckoutObject, tip, setTip, discount, setDiscount, 
    discountCode, setDiscountCode, rounded, paymentMethods, setPaymentMethods, defaultPaymentId, setDefaultPaymentId,
    drinklyCashAmount, setDrinklyCashAmount, paymentMethod, setPaymentMethod, icon, setIcon, tipIndex, setTipIndex, 
    tipsArray, cartBool, setCartBool, userCity, setUserCity, userCountry, setUserCountry, getRestaurants, rewards, setRewards, rewardsArray, setRewardsArray,
    handleSubmitDiscount, findLowestPriceIndex, discountId, setDiscountId, loadingRestaurants, setLoadingRestaurants, extraStripeCharge, setExtraStripeCharge, 
    updatePaymentMethod, itemsAndAddons, setItemsAndAddons, activeOrder, setActiveOrder}}>
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

