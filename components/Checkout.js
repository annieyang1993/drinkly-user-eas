import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import { ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemModal from '../pages/ItemModal'
import {Firebase, db} from '../config/firebase';
import {Picker} from '@react-native-picker/picker';
import ScrollPicker from 'react-native-wheel-scroll-picker';
import {Stripe, CardField, StripeProvider,useConfirmPayment, useConfirmSetupIntent, createToken, createPaymentMethod} from '@stripe/stripe-react-native'


export default function Checkout(){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation()
    const [test, setTest] = useState(authContext.dateTimeArray[Object.keys(authContext.dateTimeArray)[0]])
    const [dateIndex, setDateIndex] = useState(0)
    const [timeIndex, setTimeIndex] = useState(0)
    const [tips, setTips] = useState(0)
    const [tipIndex, setTipIndex] = useState(1)
    const [errorMessage, setErrorMessage] = useState('')
    const [paymentModal, setPaymentModal] = useState(false)
    const tipsArray = ['No tip', '5%', '10%', '15%', '18%'];
    const [paid, setPaid] = useState(false);
    const { confirmPayment } = useConfirmPayment();

    const checkIncludes = (element, array)=>{
        if (array.includes(element)){
            element = Math.random().toString(36);
            checkIncludes(element, array);
        } else{
            return element;
        }
    }

    const getPoints = async () =>{
        const tempPoints = {};
        const points = await Firebase.firestore().collection('users')
                                .doc(`${authContext.user.uid}`)
                                .collection('points').orderBy('cummulative_points', 'desc').get()
        points.docs.map((pointCard, i)=>{
            const pointsInfo = pointCard.data();
            tempPoints[pointsInfo["restaurant_id"]]=pointsInfo;
        })

        authContext.setPointsList(tempPoints);
    }

    const createCharge = async(amount) => {
        const response = await fetch('https://us-central1-drinkly-user.cloudfunctions.net/createCharge', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: authContext.userData.stripeId,
                amount: amount,
                payment_id: authContext.userData.default_payment_id
            })
        }).then(async(response)=>{
            response.json().then(async(responseJson)=>{
                return(responseJson.id)
            })
        })
        // const responseJson = await response.json();
        // //console.log(useConfirmPayment(JSON.stringify(responseJson)))
        // console.log(responseJson);
    }

    const submitOrder = async () =>{
        const total = Number(authContext.cartSubTotal) -Number(authContext.discount)+ Number(authContext.taxes) + Number(authContext.serviceFee) + Number(authContext.tip);
        var submitted = false;
        if (authContext.paymentMethod === 'Please select a payment method'){
            setErrorMessage('Please select a payment method before placing order.')
        } else if (authContext.paymentMethod === 'Credit card'){
            setErrorMessage('');
            await createCharge(authContext.rounded(authContext.rounded(total).toFixed(2)*100).toFixed(0)).then(async (id)=>{
                const {success} = await confirmPayment(id)
                console.log(success);
                submitted = true;
            });

        } else if (authContext.paymentMethod === 'Drinkly Cash'){
            if ((total) > authContext.drinklyCashAmount){
                setErrorMessage('Insufficient funds in Drinkly Cash.');
            } else{
                authContext.setDrinklyCashAmount(authContext.rounded(authContext.drinklyCashAmount - total));
                const userDataTemp = authContext.userData;
                userDataTemp["drinkly_cash"] = authContext.rounded(authContext.drinklyCashAmount - total);
                authContext.setUserData(userDataTemp);
                await Firebase.firestore().collection('users').doc(`${authContext.user.uid}`).set({drinkly_cash: authContext.rounded(authContext.drinklyCashAmount - total)}, {merge: true})
                submitted = true;
            }
            
        } else if (authContext.cartSubTotal <= 0.001 && authContext.tip <= 0.001 && authContext.taxes <= 0.001){
            submitted = true;
        }
        
        else{
            setErrorMessage('Unknown payment method')
        }

        if (submitted === true){
            writeFirebase();
        }
    }

    const writeFirebase = async () =>{
        var order_id = Math.random().toString(36);
        var ready_by = new Date().setDate(new Date().getDate()+authContext.dayIndex);
        if (authContext.afterClose===true){
            var ready_by = new Date().setDate(new Date().getDate()+authContext.dayIndex+1);
        } else{
            var ready_by = new Date().setDate(new Date().getDate()+authContext.dayIndex);
        }
        if (Object.values(authContext.dateTimeArray)[authContext.dayIndex][authContext.timeIndex]==="In 10 mins"){
            ready_by = new Date(new Date(ready_by).getTime()+10*60000);
        } else if (Object.values(authContext.dateTimeArray)[authContext.dayIndex][authContext.timeIndex]==="In 20 mins"){
            ready_by = new Date(new Date(ready_by).getTime()+20*60000);
        } else if (Object.values(authContext.dateTimeArray)[authContext.dayIndex][authContext.timeIndex]==="In 30 mins"){
            ready_by = new Date(new Date(ready_by).getTime()+30*60000);
        } else{
            var time_array = Object.values(authContext.dateTimeArray)[authContext.dayIndex][authContext.timeIndex].split(" ");
            if (time_array[1]==="PM"){
                ready_by = new Date(new Date(ready_by).setHours(Number(time_array[0].split(":")[0])+12, Number(time_array[0].split(":")[1]), 0))
            } else{
                ready_by = new Date(new Date(ready_by).setHours(Number(time_array[0].split(":")[0]), Number(time_array[0].split(":")[1]), 0))
            }
        }
        var today = new Date().toLocaleDateString();
        if (authContext.userData["order_ids"]!==undefined){
            order_id = checkIncludes(order_id, authContext.userData["order_ids"])
        }
        var user_order_ids = authContext.userData["order_ids"];
        if (user_order_ids===undefined){
            user_order_ids = [];
        }



        const data = await Firebase.firestore().collection('users')
        .doc(`${authContext.user.uid}`)
        .collection('orders')
        // .doc('orders')
        // .collection(today)
        .doc(`${order_id}`)
        .set({
            user_uid: authContext.user.uid,
            order_id: order_id,
            restaurant_id: authContext.cartRestaurant.info,
            restaurant_name: authContext.cartRestaurant.restaurant.name,
            user_first_name: authContext.userData.firstName,
            user_last_name: authContext.userData.lastName,
            subtotal: authContext.cartSubTotal,
            taxes: authContext.taxes,
            service_fee: authContext.serviceFee,
            restaurant_image: authContext.cartRestaurant.restaurant.pictures[0],
            created_at: new Date(),
            updated_at: new Date(),
            accepted: false,
            discount_bool: authContext.discountBool,
            discount: authContext.discount,
            filled: false,
            completed: false,
            canceled: false,
            number_of_items: authContext.cartNumber,
            ready_by: ready_by,
            tip: authContext.tip,
            payment_method: authContext.paymentMethod
            
        });

        Firebase.firestore().collection('restaurants')
        .doc(`${authContext.cartRestaurant.info}`)
        .collection('orders')
        // .doc('orders')
        // .collection(today)
        .doc(`${order_id}`)
        .set({
            user_uid: authContext.user.uid,
            order_id: order_id,
            restaurant_id: authContext.cartRestaurant.info,
            restaurant_name: authContext.cartRestaurant.restaurant.name,
            user_first_name: authContext.userData.firstName,
            user_last_name: authContext.userData.lastName,
            subtotal: authContext.cartSubTotal,
            taxes: authContext.taxes,
            service_fee: authContext.serviceFee,
            restaurant_image: authContext.cartRestaurant.restaurant.pictures[0],
            created_at: new Date(),
            updated_at: new Date(),
            discount_bool: authContext.discountBool,
            discount: authContext.discount,
            accepted: false,
            filled: false,
            completed: false,
            number_of_items: authContext.cartNumber,
            canceled: false,
            ready_by: ready_by,
            tip: authContext.tip,
            payment_method: authContext.paymentMethod
        }).then(async()=>{
        authContext.cart.map(async (cartItem, i)=>{
            Firebase.firestore().collection('restaurants').doc(`${authContext.cartRestaurant.info}`).collection(`orders`).doc(`${order_id}`).collection('items').doc(`${i}`).set({
                name: cartItem.name,
                description: (cartItem.details.description ? cartItem.details.description : ''),
                price: cartItem.details.price,
                img: (cartItem.details.img ? cartItem.details.img : '')
            }).then(async ()=>{ 
                if (cartItem["preference_selections"]!==undefined){
                    Object.keys(cartItem["preference_selections"]).map(async (preference, j) =>{
                        if (preference!=="special_instructions"){
                            await Firebase.firestore().collection('restaurants').doc(`${authContext.cartRestaurant.info}`).collection(`orders`).doc(`${order_id}`).collection('items').doc(`${i}`).collection('add-ons').doc(`${preference}`).set({
                                choice: cartItem["preference_selections"][preference].choice,
                                name: cartItem["preference_selections"][preference].name,
                                price: cartItem["preference_selections"][preference].price,
                                quantity: cartItem["preference_selections"][preference].quantity,
                                required: cartItem["preference_selections"][preference].required
                            })

                        } else{
                            await Firebase.firestore().collection('restaurants').doc(`${authContext.cartRestaurant.info}`).collection(`orders`).doc(`${order_id}`).collection('items').doc(`${i}`).collection('add-ons').doc(`${preference}`).set({
                                name: "special_instructions",
                                instructions: cartItem["preference_selections"][preference]
                            })
                        }
                        
                    })
                }
            })
        })

        })
        user_order_ids.push(order_id);
        const updateUser = await Firebase.firestore().collection('users').doc(`${authContext.user.uid}`).set({order_ids: user_order_ids}, {merge: true})
        const updatedUser = Firebase.firestore().collection('users').doc(`${authContext.user.uid}`)
        //const quickCheckoutTemp = authContext.quickCheckoutObject




        authContext.cart.map(async (cartItem, i)=>{
            //quickCheckoutTemp[cartItem["name"]]=cartItem;
            await Firebase.firestore().collection('users')
            .doc(`${authContext.user.uid}`)
            .collection('orders')
            // .doc('orders')
            // .collection(today)
            .doc(`${order_id}`)
            .collection('items')
            .doc(`${cartItem["name"]} - ${i}`)
            .set({
                name: cartItem["name"],
                price: cartItem["details"]["price"],
                section: cartItem["details"]["section"],
                quantity: cartItem["quantity"],
                total_price: cartItem["total_price"],
                id: `${cartItem["name"]} - ${i}`
            })

            if (cartItem["preference_selections"]!==undefined){
                Object.keys(cartItem["preference_selections"]).map(async (preference, j)=>{
                    if (preference!=="special_instructions"){
                        await Firebase.firestore().collection('users')
                            .doc(`${authContext.user.uid}`)
                            .collection('orders')
                            // .doc('orders')
                            // .collection(today)
                            .doc(`${order_id}`)
                            .collection('items')
                            .doc(`${cartItem["name"]} - ${i}`)
                            .collection('preferences')
                            .doc(preference)
                            .set({
                                name: cartItem["preference_selections"][preference]["name"],
                                choice: cartItem["preference_selections"][preference]["choice"],
                                price: cartItem["preference_selections"][preference]["price"],
                                quantity: cartItem["preference_selections"][preference]["quantity"],
                                required: cartItem["preference_selections"][preference]["required"]
                            })

                    } else{
                        await Firebase.firestore().collection('users')
                            .doc(`${authContext.user.uid}`)
                            .collection('orders')
                            // .doc('orders')
                            // .collection(today)
                            .doc(`${order_id}`)
                            .collection('items')
                            .doc(`${cartItem["name"]} - ${i}`)
                            .collection('preferences')
                            .doc(preference)
                            .set({
                                name: "special_instructions",
                                instructions: cartItem["preference_selections"][preference]
                            })
                    }
                    
                })

            } else{
                await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`)
                    .collection('orders')
                    // .doc('orders')
                    // .collection(today)
                    .doc(`${order_id}`)
                    .collection('items')
                    .doc(`${cartItem["name"]} - ${i}`)
                    .collection('preferences')
                    .doc('preference_undefined').set()
            }


            ///DEALING WITH POINTS UPDATING 
            var updateRewards = authContext.userData.rewards_collected;
            if (authContext.cartRestaurant.restaurant.rewards === true){
            if (!(authContext.pointsList[`${authContext.cartRestaurant.info}`]===undefined)){
                if (authContext.pointsList[`${authContext.cartRestaurant.info}`]["current_points"]
                ===(Number(authContext.cartRestaurant.restaurant["max_points"])-Number(authContext.cartRestaurant.restaurant.points_per_purchase))){
                    await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`)
                    .collection('points')
                    // .doc('orders')
                    // .collection(today)
                    .doc(`${authContext.cartRestaurant.info}`)
                    .set({
                        restaurant_id: authContext.cartRestaurant.info,
                        user_id: authContext.user.uid,
                        current_points: 0,
                        max_points: Number(authContext.cartRestaurant.restaurant["max_points"]),
                        rewards: authContext.pointsList[`${authContext.cartRestaurant.info}`]["rewards"]+1,
                        cummulative_rewards: authContext.pointsList[`${authContext.cartRestaurant.info}`]["cummulative_rewards"]+1,
                        cummulative_points: authContext.pointsList[`${authContext.cartRestaurant.info}`]["cummulative_points"]+Number(authContext.cartRestaurant.restaurant.points_per_purchase),
                        restaurant_name: authContext.cartRestaurant.restaurant.name,
                        restaurant_card_pic: authContext.cartRestaurant.restaurant.rewards_card_pic,
                    })

                    await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`).set({
                        rewards_collected: authContext.userData.rewards_collected+1
                    }, {merge: true});

                    updateRewards = updateRewards + 1;

                     //WRITING REWARDS!!!
                    const code = authContext.cartRestaurant.restaurant.name.slice(0,3).toUpperCase()+"REWARD"
                    const date = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString()
                    await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`)
                    .collection('rewards')
                    .doc(`${code}-${authContext.user.uid}-${authContext.userData.rewards_collected}`)
                    .set({
                        user_id: authContext.user.uid,
                        restaurant_id: authContext.cartRestaurant.restaurant.restaurant_id,
                        created_at: new Date(),
                        restaurant_name: authContext.cartRestaurant.restaurant.name,
                        used: false,
                        code: code,
                        id: `${code}-${authContext.user.uid}-${authContext.userData.rewards_collected}`,
                        max_reward_cost: authContext.cartRestaurant.restaurant.max_reward_cost,
                        reward_type: authContext.cartRestaurant.restaurant.reward_type
                    })

                    const rewardsTemp = authContext.rewards;
                    const rewardsArrayTemp = authContext.rewardsArray.map((x)=>x);
                    rewardsTemp[`${code}-${authContext.user.uid}-${authContext.userData.rewards_collected}`] = 
                        {user_id: authContext.user.uid,
                        restaurant_id: authContext.cartRestaurant.restaurant.restaurant_id,
                        created_at: new Date(),
                        restaurant_name: authContext.cartRestaurant.restaurant.name,
                        used: false,
                        code: code,
                        id: `${code}-${authContext.user.uid}-${authContext.userData.rewards_collected}`,
                        max_reward_cost: authContext.cartRestaurant.restaurant.max_reward_cost,
                        reward_type: authContext.cartRestaurant.restaurant.reward_type}
                    rewardsArrayTemp.push(`${code}-${authContext.user.uid}-${authContext.userData.rewards_collected}`);
                    authContext.setRewards(rewardsTemp);
                    authContext.setRewardsArray(rewardsArrayTemp);
                } else{
                    await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`)
                    .collection('points')
                    // .doc('orders')
                    // .collection(today)
                    .doc(`${authContext.cartRestaurant.info}`)
                    .set({
                        restaurant_id: authContext.cartRestaurant.info,
                        user_id: authContext.user.uid,
                        current_points: authContext.pointsList[`${authContext.cartRestaurant.info}`]["current_points"]+Number(authContext.cartRestaurant.restaurant.points_per_purchase),
                        max_points: Number(authContext.cartRestaurant.restaurant["max_points"]),
                        rewards: authContext.pointsList[`${authContext.cartRestaurant.info}`]["rewards"],
                        cummulative_rewards: authContext.pointsList[`${authContext.cartRestaurant.info}`]["cummulative_rewards"],
                        cummulative_points: authContext.pointsList[`${authContext.cartRestaurant.info}`]["cummulative_points"]+Number(authContext.cartRestaurant.restaurant.points_per_purchase),
                        restaurant_name: authContext.cartRestaurant.restaurant.name,
                        restaurant_card_pic: authContext.cartRestaurant.restaurant.rewards_card_pic,
                    })

                } 
            } else{
                    await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`)
                    .collection('points')
                    // .doc('orders')
                    // .collection(today)
                    .doc(`${authContext.cartRestaurant.info}`)
                    .set({
                        restaurant_id: authContext.cartRestaurant.info,
                        user_id: authContext.user.uid,
                        current_points: Number(authContext.cartRestaurant.restaurant.points_per_purchase),
                        max_points: Number(authContext.cartRestaurant.restaurant.max_points), ///NEED TO UPDATE THIS TO RESTAURANT'S MAX POINTS
                        rewards: 0,
                        cummulative_rewards: 0,
                        cummulative_points: Number(authContext.cartRestaurant.restaurant.points_per_purchase),
                        restaurant_name: authContext.cartRestaurant.restaurant.name,
                        restaurant_card_pic: authContext.cartRestaurant.restaurant.rewards_card_pic,
                        city: authContext.cartRestaurant.restaurant.city,
                        country: authContext.cartRestaurant.restaurant.country,
                        description: authContext.cartRestaurant.restaurant.description,
                        latitude: authContext.cartRestaurant.restaurant.latitude,
                        longitude: authContext.cartRestaurant.restaurant.longitude,
                        street: authContext.cartRestaurant.restaurant.street[0],
                    })
            }

            if (authContext.discountBool === true){
                await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`)
                    .collection('rewards')
                    .doc(authContext.discountId)
                    .set({
                        used: true
                    }, {merge: true})
                const rewardsTemp = authContext.rewards
                delete rewardsTemp[authContext.discountId]
                authContext.setRewards(rewardsTemp);
                authContext.setRewardsArray(Object.keys(rewardsTemp)); 

                await Firebase.firestore().collection('users')
                    .doc(`${authContext.user.uid}`)
                    .collection('points')
                    // .doc('orders')
                    // .collection(today)
                    .doc(`${authContext.cartRestaurant.info}`)
                    .set({
                        rewards: authContext.pointsList[`${authContext.cartRestaurant.info}`]["rewards"]-1,
                    }, {merge: true})



            }

            const userTemp = authContext.userData;
            userTemp["order_ids"]=user_order_ids;
            userTemp["rewards_collected"]=updateRewards;

            authContext.setUserData(userTemp);
            getPoints();
        }
            // authContext.setQuickCheckoutObject(quickCheckoutTemp);
            // authContext.setQuickCheckoutList(Object.keys(quickCheckoutTemp).reverse().slice(0, 4));
            // Object.keys(quickCheckoutTemp).reverse().slice(0, 4).map(async (quickCheckoutItem, j)=>{
            //     if (quickCheckoutTemp[quickCheckoutItem]["details"]["img"]===undefined){
            //         await Firebase.firestore().collection('users').doc(authContext.user.uid).collection('quick_checkout').doc(quickCheckoutItem).set({
            //             name: quickCheckoutTemp[quickCheckoutItem]["name"],
            //             price: quickCheckoutTemp[quickCheckoutItem]["details"]["price"],
            //             section: quickCheckoutTemp[quickCheckoutItem]["details"]["section"],
            //             quantity: 1,
            //             total_price: quickCheckoutTemp[quickCheckoutItem]["total_price"],
            //             id: `${quickCheckoutTemp[quickCheckoutItem]["name"]} - ${i}`,
            //             restaurant_id: authContext.cartRestaurant.info,
            //             restaurant_name: authContext.cartRestaurant.restaurant.name,
            //             created_at: new Date()
            //         })
            //     } else{
            //         await Firebase.firestore().collection('users').doc(authContext.user.uid).collection('quick_checkout').doc(quickCheckoutItem).set({
            //             name: quickCheckoutTemp[quickCheckoutItem]["name"],
            //             price: quickCheckoutTemp[quickCheckoutItem]["details"]["price"],
            //             section: quickCheckoutTemp[quickCheckoutItem]["details"]["section"],
            //             quantity: 1,
            //             total_price: quickCheckoutTemp[quickCheckoutItem]["total_price"],
            //             id: `${quickCheckoutTemp[quickCheckoutItem]["name"]} - ${i}`,
            //             restaurant_id: authContext.cartRestaurant.info,
            //             restaurant_name: authContext.cartRestaurant.restaurant.name,
            //             img: quickCheckoutTemp[quickCheckoutItem]["details"]["img"],
            //             created_at: new Date()
            //         })
            //     }
            // })
        
        })



        
        // updateCart([]);
        // updateCartRestaurant();
        // setItemTotals([]);
        // setWeekDayArray(['Today']);
        // setDateTimeArray({});
        // setCartRestaurantHours({});
        // setBeforeOpen(false);
        // setAfterClose(false);
        // setCartSubTotal(0);
        // setTaxes(0);
        // setServiceFee(0);
        // setDrinklyCash(false);
        // setDayIndex(0);
        // setTimeIndex(0);
        setErrorMessage('')
        navigation.navigate("Receipt");
    }

    return(
        <View style={{backgroundColor: 'white', width: '100%'}}>
            <Text style={{marginTop: 70, alignSelf: 'center', fontWeight: 'bold', fontSize: 16}}>Checkout</Text>
            <Text style={{alignSelf: 'center', fontWeight: 'bold', fontSize: 17, color: '#119aa3'}}>{authContext.cartRestaurant.restaurant.name}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: Dimensions.get("screen").height, width: '100%', backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 50}}>
                <View style={{flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: 'lightgray'}}>
                    <MaterialCommunityIcons style={{paddingVertical: 10}} size={17} name="store-outline" color='gray'/>
                    <Text style={{paddingVertical: 10, marginLeft: 10, fontWeight: 'bold', color: 'gray'}}>Pick up your order from: </Text>
                    <Text style={{position: 'absolute', right: 0, paddingVertical: 10, color: 'gray'}}>{authContext.cartRestaurant.restaurant.street[0]}</Text>
                </View>
                <View style={{borderBottomWidth: 0.5, borderBottomColor: 'lightgray', }}>
                    <TouchableOpacity onPress={()=>{setErrorMessage(''); navigation.push("Payment Methods")}}>
                        <View style={{flexDirection: 'row', width: '100%'}}>
                            <MaterialCommunityIcons style={{paddingVertical: 10}} size={17} color = 'gray' name="credit-card-outline" />
                            <Text style={{paddingVertical: 10, marginLeft: 10, fontWeight: 'bold', color: 'gray'}}>Payment method </Text>
                            <Text style={{position: 'absolute', right: 20, paddingVertical: 10, color: 'gray'}}>{authContext.paymentMethod === 'Please select a payment method' ? 'Please select' : authContext.paymentMethod}</Text>
                            <MaterialCommunityIcons style={{paddingVertical: 10, position: 'absolute', right: 0}} size={17} name="chevron-right" color={'gray'} />
                        </View>
                   </TouchableOpacity>
                </View>
                <View style={{marginTop: 10}}>
                    <Text style={{fontWeight: 'bold', marginTop: 50}}>Pickup time</Text>
                    <Text style={{color: 'gray', marginBottom: 5, marginTop: 5}}>Select an approximate pickup time for the store to have your order ready by. </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 0, marginBottom: 130}}>
                        <View style={{flexDirection: 'column'}}>

                            <Picker
                                selectedValue={String(Object.keys(authContext.dateTimeArray)[authContext.dayIndex])}
                                style={{height: 30, padding: 0, fontSize: 15, alignSelf: 'center'}}
                                itemStyle={{fontSize: 15, height: 150, width: 150, padding: 0}}
                                onValueChange={(itemValue, itemIndex) =>
                                    authContext.setDayIndex(itemIndex)
                                }>

                                {Object.keys(authContext.dateTimeArray).map((p, i)=>{
                                    return( <Picker.Item key={i} label={String(p)} value={String(p)} />)
                                })}
                            </Picker>


                            
                            
                            
                        </View>
                        <View style={{flexDirection: 'column', marginLeft: 3}}>
                            <Picker
                                selectedValue={String(Object.values(authContext.dateTimeArray)[authContext.dayIndex][authContext.timeIndex])}
                                style={{height: 30, padding: 0, fontSize: 15, alignSelf: 'center'}}
                                itemStyle={{fontSize: 15, height: 150, width: 150, padding: 0}}
                                onValueChange={(itemValue, itemIndex) =>
                                    authContext.setTimeIndex(itemIndex)
                                }>

                                {((Object.values(authContext.dateTimeArray))[authContext.dayIndex]).map((p, i)=>{
                                    return( <Picker.Item key={i} label={String(p)} value={String(p)} />)
                                })}
                            </Picker>
                        </View>
                    </View>
                    {authContext.beforeOpen ? <Text style={{alignSelf: 'center', fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 10, width: 200}}> The store has not opened yet. Please select a time after the store opens. </Text> : null}
                    {authContext.afterClose ? <Text style={{alignSelf: 'center', fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 10, width: 200}}> The store is closed today. Please select a time for future pickup. </Text> : null}

                </View>


            </ScrollView>
            <View style={{backgroundColor: 'white', bottom: '17%', position: 'absolute', width: '100%', height: 80}}>
            <Text style = {{alignSelf: 'center', color: 'red', marginBottom: 1}}>{errorMessage}</Text>

            <TouchableOpacity style={{width: '95%', alignSelf: 'center', paddingVertical: 11, shadowColor: 'black', 
                    shadowOffset: {width: 2, height: 2}, 
                    shadowRadius: 3, 
                    shadowOpacity: 0.8, paddingHorizontal: 30, backgroundColor: '#119aa3', borderRadius: 20, textAlign: 'center'}} 
            onPress={async ()=>{
                submitOrder()
                // if (authContext.userData["default_card"]===undefined){
                //     setPaymentModal(true)
                // } else{
                // }
            }}>
                    <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 16}}>Place Order (${authContext.rounded(authContext.cartSubTotal -authContext.discount + authContext.taxes + authContext.serviceFee + authContext.tip).toFixed(2)})</Text>
            </TouchableOpacity> 
            </View>
            <TouchableOpacity
                style={{backgroundColor: 'white',
                borderRadius: 10,
                width: 20,
                height: 20,
                position: 'absolute',
                marginTop: 50,
                marginHorizontal: 20,
                
                zIndex: 50,
                }}
                onPress={() => {
                    setErrorMessage('');
                    navigation.pop(1)
                }}>
                <MaterialCommunityIcons name="arrow-left" size={22}/>
            </TouchableOpacity> 
            <Modal
                animationType="slide"
                transparent={true}
                visible={paymentModal}
                onRequestClose={() => {
                    // this.closeButtonFunction()
                }}>

                <View
                    style={{
                    height: '30%',
                    marginTop: 'auto',
                    backgroundColor:'white',
                    borderRadius: 20,
                    paddingTop: 10,
                    shadowColor: 'black', 
                    shadowOffset: {width: 3, height: 3}, 
                    shadowRadius: 10, 
                    shadowOpacity: 0.3,
                    }}>
                    
                    <TouchableOpacity
                    style={{backgroundColor: 'white',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    position: 'absolute',
                    margin: 10,
                    zIndex: 50,
                    }}
                    onPress={() => {
                        setPaymentModal(false)
                    }}>
                    <Text style={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    color: 'gray',
                    fontSize: 15}}><MaterialCommunityIcons name="close" size={20}/></Text>
                    </TouchableOpacity>

                    <Text style={{alignSelf: 'center', fontWeight: 'bold', marginTop: 5}}>Select a Payment Method</Text>
                    <View>
                    </View>
                </View>

            </Modal>
        </View>
    )
}