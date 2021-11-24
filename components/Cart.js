import AuthContext from '../context/Context'
import React, {useContext, useState, useEffect} from 'react';
import { ScrollView, View, StyleSheet, TextInput, TouchableOpacity, TouchableHighlight, Text, Modal, Image, Dimensions, InteractionManager } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemModal from '../pages/ItemModal'
import {Firebase, db} from '../config/firebase';
import ScrollPicker from 'react-native-wheel-scroll-picker';

const auth = Firebase.auth();


export default function Cart({route}){
    const authContext = useContext(AuthContext);
    const navigation = useNavigation()
    const [editItemDetails, setEditItemDetails] = useState({})
    const [selections, setSelections] = useState({})
    const [itemPreferences, editItemPreferences] = useState({})
    const [itemQuantity, editItemQuantity] = useState(0);
    const [index, setIndex] = useState(0);
    const [test, setTest] = useState(authContext.dateTimeArray[Object.keys(authContext.dateTimeArray)[0]])
    const [dateIndex, setDateIndex] = useState(0)
    const [timeIndex, setTimeIndex] = useState(0)
    const [itemTotal, setItemTotal] = useState(0);
    const [editModal, setEditModal] = useState(false);
    const [cartModal, setCartModal] = useState(true);
    const [paymentSelected, setPaymentSelected] = useState(false);
    const [cartTotal, setCartTotal] = useState(0)
    const [errorMessage, setErrorMessage] = useState('');
    const tipsArray = ['No tip', '5%', '10%', '15%', '18%'];
    const [tipIndex, setTipIndex] = useState(1)
    const [tips, setTips] = useState(0)
    const [code, setCode] = useState('')
    const [discountErrorMessage, setDiscountErrorMessage] = useState('');

    const getSelections=async (item, j)=>{
        await setSelections({});
        const selectionsTemp = {};
        await Firebase.firestore()
          .collection('restaurants')
          .doc(`${authContext.cartRestaurant.restaurant["name"]}-${authContext.cartRestaurant.restaurant["street"][0]}-${authContext.cartRestaurant.restaurant["city"]}`)
          .collection('items')
          .doc(item["name"]).collection('add-ons').get().then(async (addons)=>{
          await addons.docs.map((addon, i)=>{
              selectionsTemp[addon.data().name]=addon.data();
          })
        await setSelections(selectionsTemp);
        await setEditItemDetails(item["details"])
        await editItemPreferences(JSON.parse(JSON.stringify(item["preference_selections"])))
        await editItemQuantity(item["quantity"])
        await setItemTotal(item["total_price"])
        await setIndex(j)
        })
    }

      const setTip = async (subtotal, i)=>{
        if (i === 0){
        await authContext.setTip(0);
        return 0
        } else if (i===1){
        await authContext.setTip(0.05 * subtotal)
        return (0.05 * subtotal)
        } else if (i===2){
        await authContext.setTip(0.1 * subtotal)
        return (0.1 * subtotal)
        } else if (i===3){
        await authContext.setTip(0.15 * subtotal)
        return (0.15 * subtotal)
        } else if (i===4){
        await authContext.setTip(0.18 * subtotal)
        return (0.18 * subtotal)
        }
    }

    const setPaymentMethod = async (subtotal, tip, taxes) =>{
        const paymentMethodTemp = authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? (authContext.defaultPaymentId=== undefined || authContext.defaultPaymentId === '' ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash';
        await authContext.setPaymentMethod(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? (authContext.defaultPaymentId=== undefined || authContext.defaultPaymentId === ''? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
        await authContext.setIcon(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? (authContext.defaultPaymentId=== undefined || authContext.defaultPaymentId === ''? '' : 'credit-card') : 'cash')
        if (paymentMethodTemp === 'Drinkly Cash'){
        await authContext.setServiceFee(0);
        } else{
        await authContext.setServiceFee(0.15);
        }
    }

    const checkContinue = async () =>{
      if (authContext.paymentMethod === 'Please select a payment method'){
        setErrorMessage('Please select a payment method before continuing.');
      } else{
        setErrorMessage('');
        navigation.navigate("Checkout")
      }
    }

    const handleSubmitDiscount = async (text) =>{
        var found = false;
        var index = 0;

        authContext.rewardsArray.map((reward, i)=>{
            if (authContext.rewards[reward]["code"]===text && authContext.rewards[reward]["restaurant_id"]===authContext.cartRestaurant.info){
                found = true;
                index = i;
            }
        })

        if (text===''){
            setDiscountErrorMessage('');
            authContext.setDiscount(0);
            authContext.setDiscountCode('')
            authContext.setDiscountBool(false);
        }

        else if (found === true){
            authContext.setDiscountBool(true);
            var discountTotal = 0;
            if (authContext.rewards[authContext.rewardsArray[index]]["reward_type"]==="Drink"){
                const {cartIndex, itemprice} = await findLowestPriceIndex();
                console.log("PRICE HERE", itemprice);
                console.log(Number(itemprice)<Number(authContext.rewards[authContext.rewardsArray[index]]["max_reward_cost"]))
                if (Number(itemprice)<Number(authContext.rewards[authContext.rewardsArray[index]]["max_reward_cost"])){
                    authContext.setDiscount(itemprice);
                    discountTotal = itemprice;
                } else{
                     authContext.setDiscount(Number(authContext.rewards[authContext.rewardsArray[index]]["max_reward_cost"]));
                     discountTotal = Number(authContext.rewards[authContext.rewardsArray[index]]["max_reward_cost"]);
                }
            }

            if ((authContext.cartSubTotal-discountTotal)<4){
                authContext.setTaxes((authContext.cartSubTotal-discountTotal)*0.05);
            } else{
                authContext.setTaxes((authContext.cartSubTotal-discountTotal)*0.13);
            }

            setTip(Number(authContext.cartSubTotal)-Number(discountTotal), authContext.tipIndex);
            if (authContext.rounded(Number(authContext.cartSubTotal-Number(discountTotal))) === 0){
                authContext.setServiceFee(0);
            }

            
            setDiscountErrorMessage('');
            authContext.setDiscountCode(text);

        } else{
            authContext.setDiscountBool(false);
            setDiscountErrorMessage('Code does not exist for this cafe.')
            authContext.setDiscount(0);
            authContext.setDiscountCode('')
        }
        
    }

    const findLowestPriceIndex = async () => {
        var index = 0;
        var itemprice = 0;
        authContext.cart.map((item, i)=>{
            
            if (i===0){
                itemprice = authContext.rounded(Number(item["total_price"])).toFixed(2);
            } else{
                if (authContext.rounded(Number(item["total_price"])).toFixed(2)<Number(itemprice)){
                    index = i;
                    itemprice = authContext.rounded(Number(item["total_price"])).toFixed(2);
                }
            }

        })
        return {index, itemprice}
    }

    useEffect(()=>{
      setCartModal(true)
      if (authContext.cartSubTotal <= 4){
        setCartTotal(authContext.rounded(authContext.cartSubTotal*1.05+0.15).toFixed(2));
      } else{
        setCartTotal(authContext.rounded(authContext.cartSubTotal*1.13+0.15).toFixed(2));
      }
      setTip(authContext.cartSubTotal-authContext.discount, authContext.tipIndex);
    }, [])

    return(
        
        <View style={{backgroundColor: 'white'}}>
            {console.log(authContext.cart)}
            {authContext.cart.length === 0 ? 
            <ScrollView showsVerticalScrollIndicator={false} style={{height: Dimensions.get("screen").height, backgroundColor: 'white'}}>
            <Text style={{marginTop: 70, alignSelf: 'center', fontWeight: 'bold', fontSize: 16}}>Your cart from</Text>
            <Text style={{alignSelf: 'center', fontWeight: 'bold', fontSize: 18, color: '#119aa3'}}>{authContext.cartRestaurant.restaurant.name}</Text>

            <Text style={{alignSelf: 'center', marginTop: '50%'}}>Your cart is empty. Add items to get started.</Text> 
            <TouchableOpacity
                    style={{backgroundColor: 'white',
                    borderRadius: 10,
                    position: 'absolute',
                    margin: 10,
                    marginHorizontal: 20,
                    zIndex: 50,
                    marginTop: 50,
                    color: 'gray'
                    }}
                    onPress={() => {
                        navigation.navigate(authContext.prevScreen, authContext.prevScreenParams)
                    }}>
                    <Text style={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    color: 'gray',
                    fontSize: 15, padding: 5}}><MaterialCommunityIcons name="close" size={25}/></Text>
                </TouchableOpacity></ScrollView> : 
            <View>
            
            <View style={{height: '100%', width: '100%', borderRadius: 20, backgroundColor: 'white', paddingTop: 70, paddingBottom: 20}}>
            <Text style={{alignSelf: 'center', fontWeight: 'bold', fontSize: 16}}>Your cart from</Text>
            <Text style={{alignSelf: 'center', fontWeight: 'bold', fontSize: 18, color: '#119aa3'}}>{authContext.cartRestaurant.restaurant.name}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{height: Dimensions.get("screen").height, backgroundColor: 'white', paddingHorizontal: 20, }}>            
            
         
            <View style={{flexDirection: 'row', width: '100%', marginTop: 40, }}>
            
            <Text style={{fontSize: 17, fontWeight: 'bold', marginTop: 20, }}>Items</Text>
                        <TouchableOpacity style = {{ alignItems: 'center', padding: 6, borderRadius: 15,alignSelf: 'flex-end', right: 0, position: 'absolute', top: 18}} onPress={()=>{
                var modalsTemp = {}
                Object.values(authContext.cartRestaurantItems).map((item,i)=>{
                    modalsTemp[item["name"]] = false;
                })
                navigation.navigate("Cart Restaurant Page", {restaurant: authContext.cartRestaurant.restaurant, itemsArr: authContext.cartRestaurantItems, modals: modalsTemp, times: authContext.cartRestaurantHours})
                setErrorMessage('');
                }}>
                <Text style={{fontWeight: 'bold', fontSize: 13, color: '#4b4c4c'}}>+ Add Items</Text>
            </TouchableOpacity>
            </View>
            <View>{authContext.cart.map((item, i)=>{
            return(
            <View key={i}>
            <View style={{flexDirection: 'row', marginTop: 20}}>
                <View style={{width: '20%'}}>
                <TouchableOpacity onPress={async ()=>{getSelections(item, i).then(()=>{authContext.setEditItem(true)})}}>
                <Image style = {{height: 70, borderRadius: 20}} source={{uri: item["details"]["img"]}}/>
                
                <View style={{alignItems: 'center', padding: 5, borderRadius: 10, marginTop: 5}}>
                <Text style = {{fontWeight: 'bold', fontSize: 13}}>Edit</Text>
                    
                </View></TouchableOpacity>
                </View>


                <View style={{width: '80%', borderBottomWidth: 1, borderBottomColor: 'lightgray', paddingBottom: 10}}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{width: '75%', paddingLeft: 10}}>
                            <Text style={{fontWeight: 'bold'}}>{item["name"]} </Text>
                        </View>

                        <View style={{width: '25%'}}>
                            <Text style={{alignSelf: 'flex-end'}}> ${authContext.rounded(item["total_price"]).toFixed(2)} x{item["quantity"]}</Text>
                        </View>
                    </View>
                

                <View style={{marginLeft: 10, marginTop: 5, width: '100%'}}>
                {Object.values(item["preference_selections"]).length===0 ? <Text style={{fontSize: 12,  color: '#646666'}}>No add-ons or selections</Text>: <View>
                {Object.keys(item["preference_selections"]).map((selection, j)=>{
                    if (!(selection==="special_instructions")){
                        if (item["preference_selections"][selection]["required"]===true){
                            return(<View key={j} style={{width: '100%', flexDirection: 'row', marginTop: 5}}>
                                    <Text style={{fontSize: 12,  color: '#646666', width: '75%'}}>{item["preference_selections"][selection]["choice"]}</Text>                                
                                </View>)
                        }  
                    }
                    
                })}
                {Object.keys(item["preference_selections"]).map((selection, j)=>{
                    if (!(selection==="special_instructions")){
                        if (item["preference_selections"][selection]["required"]===false){
                            return(<View key={j} style={{width: '100%', flexDirection: 'row', marginTop: 5}}>
                                <Text key={j} style={{fontSize: 12,  color: '#646666', width: '75%'}}>+ {item["preference_selections"][selection]["choice"]} ({item["preference_selections"][selection]["quantity"]}x)</Text>
                             </View>)
                        }
                    }
                })}

                {item["preference_selections"]["special_instructions"]===undefined ? null : <Text style={{fontSize: 12,  color: '#646666', marginTop: 5, marginBottom: 15}}>Special instructions: {item["preference_selections"]["special_instructions"]} </Text>}
                </View>}
                
                </View>          
                </View>
                
           
            </View>
            <View style={{flexDirection: 'row'}}>
            <View style={{width: '20%'}}><TouchableOpacity style={{alignSelf: 'center', marginTop: 10}} onPress={async ()=>{
            
            var cartTemp = authContext.cart.map((x)=>x);
            cartTemp.splice(i, 1)
            authContext.setCartNumber(authContext.cartNumber-authContext.cart[i]["quantity"])
            await authContext.handleSubmitDiscount(authContext.discountCode).then(async (discount)=>{
            await authContext.setCartSubTotal(authContext.cartSubTotal-authContext.cart[i]["quantity"]*authContext.cart[i]["total_price"])
            var taxesTemp = 0;
            if ((Number(authContext.cartSubTotal)-Number(authContext.cart[i]["quantity"])*Number(authContext.cart[i]["total_price"]) - Number(discount))<4){
            await authContext.setTaxes((Number(authContext.cartSubTotal)-Number(authContext.cart[i]["quantity"])*Number(authContext.cart[i]["total_price"]) - Number(discount))*0.05);
            taxesTemp = (Number(authContext.cartSubTotal)-Number(authContext.cart[i]["quantity"])*Number(authContext.cart[i]["total_price"]) - Number(discount))*0.05;
            } else{
            await authContext.setTaxes((Number(authContext.cartSubTotal)-Number(authContext.cart[i]["quantity"])*Number(authContext.cart[i]["total_price"]) - Number(discount))*0.13);
            taxesTemp = (Number(authContext.cartSubTotal)-Number(authContext.cart[i]["quantity"])*Number(authContext.cart[i]["total_price"]) - Number(discount))*0.13;
            }

            await setTip(authContext.cartSubTotal-discount-authContext.cart[i]["quantity"]*authContext.cart[i]["total_price"], authContext.tipIndex).then(async (tip) => {
                await setPaymentMethod(authContext.cartSubTotal-discount - authContext.cart[i]["quantity"]*authContext.cart[i]["total_price"], tip, taxesTemp);
            });
              
            });
            authContext.updateCart(cartTemp);
            if (Object.values(cartTemp).length === 0 ){
                authContext.setDiscount(0);
                authContext.setDiscountCode('');
                authContext.setDiscountBool(false);

                authContext.updateCart([]);
                authContext.updateCartRestaurant({});
                authContext.setItemTotals([]);
                authContext.setWeekDayArray(['Today']);
                authContext.setDateTimeArray({});
                authContext.setCartRestaurantHours({});
                authContext.setBeforeOpen(false);
                authContext.setAfterClose(false);
                authContext.setCartSubTotal(0);
                authContext.setTaxes(0);
                authContext.setServiceFee(0);
                authContext.setDayIndex(0);
                authContext.setTimeIndex(0);
                authContext.setTip(0);
                authContext.setDiscountCode('');
                authContext.setTipIndex(1);

            }

            }}><Text><MaterialCommunityIcons name="trash-can-outline" size={20} style={{opacity: 0.5}}/></Text></TouchableOpacity></View>
            <View style={{width: '60%'}}></View>
            <Text style={{width: '20%', alignSelf: 'flex-end', textAlign: 'right', fontSize: 15, fontWeight: 'bold', marginTop: 10, marginBottom: 20}}>${authContext.rounded(item["total_price"]*item["quantity"]).toFixed(2)}</Text>
            </View>

            </View>
            )

            
            })}  

            <View style={{paddingHorizontal: 10}}>
                <Text style={{fontWeight: 'bold', marginTop: 50, fontSize: 15}}>Payment Method</Text>
                <Text style={{marginBottom: 5, color: 'gray', marginTop: 5}}>Select a payment method</Text>
                
                <View style={{borderBottomWidth: 0.5, borderColor: 'gray', padding: 5, marginVertical: 10, width: '100%'}}>
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>{navigation.navigate("Payment Methods"); setErrorMessage('')}}>
                    <MaterialCommunityIcons name={authContext.icon} size={17} color={'gray'}/>
                    <Text style={{color: 'gray', marginLeft: authContext.paymentMethod === 'Please select a payment method' ? 0 : 10}}>
                        {authContext.paymentMethod}
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={17} style={{right: 0, position: 'absolute', color: 'gray'}}/>
                     </TouchableOpacity>
                </View>
                
            </View>

            <View style={{marginTop: 40, paddingHorizontal: 10}}>
                    <Text style={{fontWeight: 'bold'}}>Discount or Reward Code</Text>
                    <Text style={{marginBottom: 5, color: 'gray', marginTop: 5}}>Enter a discount/reward code</Text>
                    <View style={{flexDirection: 'row', height: 30, marginVertical: 10, borderWidth: 0.5, borderRadius: 5, borderColor: 'gray'}}>
                        <TextInput
                            autoCapitalize="characters" 
                            autoCorrect={false}
                            style={{width: '100%', height: 30}}
                            placeholder="Discount code"
                            placeholderTextColor="lightgray"
                            defaultValue={authContext.discountCode}
                            onSubmitEditing={({nativeEvent: {text, eventCount, target}})=>{
                                setCode(text);
                                handleSubmitDiscount(text);
                            }}
                            style={{borderRadius: 2, paddingHorizontal: 5, width: '100%'}}
                            >
                        
                        </TextInput>

                        {authContext.discountBool === true ? <MaterialCommunityIcons name="check-circle" color="green" style = {{position: 'absolute', right: 5, marginTop: 5}} size={20}/> : null}
                        
                    </View>
                </View>
            <Text style={{alignSelf: 'flex-start', marginLeft: 5, color: 'gray', marginTop: -5}}>{discountErrorMessage}</Text>

            <Text style={{fontWeight: 'bold', marginTop: 30, paddingHorizontal: 10, fontSize: 15}}>Total</Text>

            <View style={{paddingHorizontal: 10}}>
                <View style={{flexDirection: 'row', width: '100%', marginTop: 10, color: 'gray'}}>
                    <Text style={{ marginTop: 20, color: 'gray'}}>Subtotal</Text>
                    <MaterialCommunityIcons name="information-outline" style={{marginTop: 20, color: 'gray', marginLeft: 10}}/>
                    <Text style={{ marginTop: 20, position: 'absolute', right: 0, color: 'gray'}}>${authContext.rounded(authContext.cartSubTotal).toFixed(2)}</Text>
                </View>

                {authContext.discountBool === true ? <View><View style={{flexDirection: 'row', width: '100%', color: 'gray'}}>
                    <Text style={{marginTop: 5, color: 'green', fontWeight: 'bold'}}>Discount</Text>
                    <Text style={{marginTop: 5, color: 'green', fontWeight: 'bold', position: 'absolute', right: 0}}>- ${authContext.rounded(Number(authContext.discount)).toFixed(2)}</Text>
                </View> 
                
                <View style={{flexDirection: 'row', width: '100%', marginTop: 5, marginBottom: 10, color: 'gray'}}>
                    <Text style={{color: 'gray'}}>Subtotal</Text>
                    <MaterialCommunityIcons name="information-outline" style={{color: 'gray', marginLeft: 10}}/>
                    <Text style={{position: 'absolute', right: 0, color: 'gray'}}>${authContext.rounded(authContext.cartSubTotal).toFixed(2)-authContext.rounded(Number(authContext.discount)).toFixed(2)}</Text>
                </View>
                          
                </View>
                
                
                
                
                
                
                : null}

                <View style={{flexDirection: 'row', width: '100%', color: 'gray'}}>
                    
                    <Text style={{marginTop: 5, color: 'gray'}}>Estimated taxes</Text>
                    <MaterialCommunityIcons name="information-outline" style={{marginTop: 5, color: 'gray', marginLeft: 10}}/>
                    <Text style={{marginTop: 5, color: 'gray', position: 'absolute', right: 0}}>${authContext.rounded(authContext.taxes).toFixed(2)}</Text> 
                </View>
                <View style={{flexDirection: 'row', width: '100%', color: 'gray'}}>
                    <Text style={{marginTop: 5, color: 'gray'}}>Service fee</Text>
                    <MaterialCommunityIcons name="information-outline" style={{marginTop: 5, color: 'gray', marginLeft: 10}}/>
                    <Text style={{marginTop: 5, color: 'gray', position: 'absolute', right: 0}}>${authContext.rounded(authContext.serviceFee).toFixed(2)}</Text>
                </View>

                <View style={{flexDirection: 'row', width: '100%', color: 'gray', paddingBottom: 10}}>
                    <Text style={{marginTop: 5, color: 'gray'}}>Tip</Text>
                    <MaterialCommunityIcons name="information-outline" style={{marginTop: 5, color: 'gray', marginLeft: 10}}/>
                    <Text style={{marginTop: 5, color: 'gray', position: 'absolute', right: 0}}>${authContext.rounded(authContext.tip).toFixed(2)}</Text>
                </View>


                <View style={{flexDirection: 'row', width: '100%', marginBottom: 5, borderTopWidth: 0.5, borderTopColor: 'gray', }}>
                    <Text style={{fontWeight: 'bold', marginTop: 5}}>Total</Text>
                    <Text style={{fontWeight: 'bold', marginTop: 5, position: 'absolute', right: 0}}>${authContext.rounded(authContext.cartSubTotal - authContext.discount+ authContext.taxes + authContext.serviceFee + authContext.tip).toFixed(2)}</Text>
                </View> 
            </View>

            <View style={{marginTop: 40, paddingHorizontal: 10}}>
                    <Text style={{fontWeight: 'bold'}}>Tip</Text>
                    <Text style={{marginBottom: 5, color: 'gray', marginTop: 5}}>Tip {authContext.cartRestaurant.restaurant.name}</Text>
                    <View style={{flexDirection: 'row'}}>
                        {authContext.tipsArray.map((tip, i)=>{
                            if (i===authContext.tipIndex){
                                return(<View key={i} style={{backgroundColor: '#afb2b2', width: '18%', margin: '1%', alignItems: 'center', padding: 5, borderRadius: 3}}><Text>{tip}</Text></View>)
                            } else{
                                return(
                                <TouchableHighlight key={i} underlayColor='#afb2b2' style={{backgroundColor: '#dadede', width: '18%', margin: '1%', alignItems: 'center', padding: 5, borderRadius: 3}} onPress={async ()=>{authContext.setTipIndex(i); setTip(authContext.cartSubTotal, i)}}>
                                    <View ><Text>{tip}</Text></View>
                                </TouchableHighlight>)
                            }
                        })}
                    </View>
                </View>

            {/* <View>
                <Text style={{fontWeight: 'bold', marginTop: 20}}>Pickup time</Text>
                <Text style={{color: 'gray', marginBottom: 5}}>Select an approximate pickup time for the store to have your order ready by. </Text>
                <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 10}}>
                    <View style={{flexDirection: 'column'}}>
                        <ScrollPicker
                            dataSource={Object.keys(authContext.dateTimeArray)}
                            selectedIndex={dateIndex}
                            renderItem={(data, index, isSelected) => {
                                //
                            }}
                            onValueChange={(data, selectedIndex) => {
                                setTest(authContext.dateTimeArray[Object.keys(authContext.dateTimeArray)[selectedIndex]])                            
                                //
                            }}
                            wrapperHeight={140}
                            wrapperWidth={80}
                            wrapperBackground={'#ffffff'}
                            itemHeight={30}
                            highlightColor={'#afb2b2'}
                            highlightBorderWidth={2}
                            highlightWidth={80}
                            itemColor={'gray'}
                            />
                    </View>
                    <View style={{flexDirection: 'column', marginLeft: 3}}>
                        <ScrollPicker
                            dataSource={test}
                            selectedIndex={timeIndex}
                            renderItem={(data, index, isSelected) => {
                                //
                            }}
                            onValueChange={(data, selectedIndex) => {
                                //
                            }}
                            wrapperHeight={140}
                            wrapperWidth={100}
                            wrapperBackground={'#ffffff'}
                            itemHeight={30}
                            highlightColor={'#afb2b2'}
                            highlightBorderWidth={2}
                            highlightWidth={100}
                            itemColor={'gray'}
                            />
                    </View>
                </View>
                {authContext.beforeOpen ? <Text style={{alignSelf: 'center', fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 20, width: 200}}> The store has not opened yet. Please select a time after the store opens. </Text> : null}
                {authContext.afterClose ? <Text style={{alignSelf: 'center', fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 20, width: 200}}> The store is closed today. Please select a time for future pickup. </Text> : null}

            </View> */}


            {/* <View >
                <Text style={{fontSize: 15, fontWeight: 'bold', marginTop: 40}}>Tip</Text>
                <Text style={{marginBottom: 5, color: 'gray'}}>Tip {authContext.cartRestaurant.restaurant.name}</Text>
                <View style={{flexDirection: 'row'}}>
                    {tipsArray.map((tip, i)=>{
                        if (i===tipIndex){
                            return(<View key={i} style={{backgroundColor: '#afb2b2', width: '18%', margin: '1%', alignItems: 'center', padding: 5, borderRadius: 3}}><Text>{tip}</Text></View>)
                        } else{
                            return(
                            <TouchableHighlight key={i} underlayColor='#afb2b2' style={{backgroundColor: '#dadede', width: '18%', margin: '1%', alignItems: 'center', padding: 5, borderRadius: 3}} onPress={()=>setTipIndex(i)}>
                                <View ><Text>{tip}</Text></View>
                            </TouchableHighlight>)
                        }
                    })}
                </View>
            </View> */}
           



            <View style={{height: 200}}>
            </View>

            </View>

            

            
         

        
        </ScrollView> 

        </View>
        <TouchableOpacity
            style={{backgroundColor: 'white',
            borderRadius: 10,
            width: 20,
            height: 20,
            position: 'absolute',
            marginTop: 50,
            marginHorizontal: 20,
            color: 'gray',
            zIndex: 50,
            }}
            onPress={() => {
                navigation.pop(1);
                authContext.setCartBool(false);
                //navigation.navigate(authContext.prevScreen, authContext.prevScreenParams)
            }}>
            <MaterialCommunityIcons name="close" size={22}/>
        </TouchableOpacity> 

        
        <View style={{bottom: '6%', position: 'absolute', width: '100%', height: 100}}>
          <Text style={{alignSelf: 'center', textAlign: 'center', color: 'red', marginBottom: 10}}>{errorMessage}</Text>
        <TouchableOpacity style={{position: 'absolute', top: '0%', marginTop: 20, width: '95%', alignSelf: 'center', shadowColor: 'black', 
                    shadowOffset: {width: 2, height: 2}, 
                    shadowRadius: 3, 
                    shadowOpacity: 0.8, paddingVertical: 11, paddingHorizontal: 30, backgroundColor: '#119aa3', borderRadius: 20, textAlign: 'center'}} 
        onPress={()=>checkContinue()}>
                <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 16}}>Continue (${authContext.rounded(authContext.cartSubTotal + authContext.taxes + authContext.serviceFee + authContext.tip).toFixed(2)})</Text>
        </TouchableOpacity> 
        </View>

        <Modal visible={authContext.editItem} backgroundColor='white' animationType='slide' style={{zIndex: 500}}>
            <View style={{height: '95%', width: '100%', backgroundColor: 'white', position: 'absolute', bottom: '0%'}}>
            <ItemModal item={editItemDetails} selections={selections} preferences={itemPreferences} itemQuantity={itemQuantity} index={index} total={itemTotal}/>
            </View>
        </Modal>
        </View>
        }
     
     </View>
    )
}