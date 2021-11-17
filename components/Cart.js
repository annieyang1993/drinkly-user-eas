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
    const [tips, setTips] = useState(0)
    const [tipIndex, setTipIndex] = useState(1)
    const tipsArray = ['No tip', '5%', '10%', '15%', '18%'];
    const [test, setTest] = useState(authContext.dateTimeArray[Object.keys(authContext.dateTimeArray)[0]])
    const [dateIndex, setDateIndex] = useState(0)
    const [timeIndex, setTimeIndex] = useState(0)
    const [itemTotal, setItemTotal] = useState(0);
    const [editModal, setEditModal] = useState(false);
    const [cartModal, setCartModal] = useState(true);

    const roundTwo=(number)=>{
        const split = String(number).split('.')
    }

const setWeekdayAndTimeArrays = async ()=>{
      authContext.setPrevScreen("Search2")
      authContext.setPrevScreenParams({})
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      var minReadyIn = 10
      var today = new Date().getDay()
      const weekDayArrayTemp = ['Today'];
      ([1,2,3,4]).map((day, i)=>{
          weekDayArrayTemp.push(weekdays[(today+day)%7]);
          
      })

      authContext.setWeekDayArray(weekDayArrayTemp)

      var currentTimeIncrement = new Date(new Date().getTime()+minReadyIn*60000)
      var coeff = 1000*60*5;
      var roundUp = new Date(Math.ceil(currentTimeIncrement.getTime()/coeff)*coeff)
      const dateTimeArrayTemp = {}
      var open = authContext.cartRestaurantHours[weekdays[today]]["open"]
      var close = authContext.cartRestaurantHours[weekdays[today]]["close"]
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
        authContext.setAfterClose(true)
        afterClose = true;
      }

      if (roundUp.getTime()<day.getTime()){
        authContext.setBeforeOpen(true)
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
            open = authContext.cartRestaurantHours[weekday]["open"]
            close = authContext.cartRestaurantHours[weekday]["close"]

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
      authContext.setDateTimeArray(dateTimeArrayTemp);
  }

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

    useEffect(()=>{
      console.log("Hello")
        setCartModal(true)
    }, [])

    return(
        <View style={{backgroundColor: 'white'}}>
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
            <View style={{width: '20%'}}><TouchableOpacity style={{alignSelf: 'center', marginTop: 10}} onPress={()=>{
            
            var cartTemp = authContext.cart.map((x)=>x);
            cartTemp.splice(i, 1)
            authContext.setCartNumber(authContext.cartNumber-authContext.cart[i]["quantity"])
            authContext.setCartSubTotal(authContext.cartSubTotal-authContext.cart[i]["quantity"]*authContext.cart[i]["total_price"])
            authContext.updateCart(cartTemp);

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
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>navigation.navigate("Payments")}>
                    <MaterialCommunityIcons name="cash" size={17} color={'gray'}/>
                    <Text style={{color: 'gray', marginLeft: 10}}>
                        Drinkly cash
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={17} style={{right: 0, position: 'absolute', color: 'gray'}}/>
                     </TouchableOpacity>
                </View>
                
            </View>

            <Text style={{fontWeight: 'bold', marginTop: 30, paddingHorizontal: 10, fontSize: 15}}>Total</Text>

            <View style={{paddingHorizontal: 10}}>
                <View style={{flexDirection: 'row', width: '100%', marginTop: 10, color: 'gray'}}>
                    <Text style={{ marginTop: 20, color: 'gray'}}>Subtotal</Text>
                    <Text style={{ marginTop: 20, position: 'absolute', right: 0, color: 'gray'}}>${authContext.rounded(authContext.cartSubTotal).toFixed(2)}</Text>
                </View>
                <View style={{flexDirection: 'row', width: '100%', color: 'gray'}}>
                    
                    <Text style={{marginTop: 5, color: 'gray'}}>Estimated taxes</Text>
                    <Text style={{marginTop: 5, color: 'gray', position: 'absolute', right: 0}}>${authContext.taxes.toFixed(2)}</Text> 
                </View>
                <View style={{flexDirection: 'row', width: '100%', color: 'gray', borderBottomWidth: 0.5, borderBottomColor: 'gray', paddingBottom: 10}}>
                    <Text style={{marginTop: 5, color: 'gray'}}>Service fee</Text>
                    <Text style={{marginTop: 5, color: 'gray', position: 'absolute', right: 0}}>${0.15}</Text>
                </View>

                {authContext.cartSubTotal < 4 ? 
                <View style={{flexDirection: 'row', width: '100%', marginBottom: 5}}>
                    <Text style={{fontWeight: 'bold', marginTop: 5}}>Total</Text>
                    <Text style={{fontWeight: 'bold', marginTop: 5, position: 'absolute', right: 0}}>${authContext.rounded(authContext.cartSubTotal*1.05+0.15).toFixed(2)}</Text>
                </View> : 

                <View style={{flexDirection: 'row', width: '100%', marginTop: 5}}>
                    <Text style={{fontWeight: 'bold', marginTop: 5}}>Total</Text>
                    <Text style={{fontWeight: 'bold', marginTop: 5, position: 'absolute', right: 0}}>${authContext.rounded(authContext.cartSubTotal*1.13+0.15).toFixed(2)}</Text>
                </View>}
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
                navigation.pop(1)
                //navigation.navigate(authContext.prevScreen, authContext.prevScreenParams)
            }}>
            <MaterialCommunityIcons name="close" size={22}/>
        </TouchableOpacity> 
        <View style={{backgroundColor: 'white', bottom: '0%', position: 'absolute', width: '100%', height: 80}}>
        <TouchableOpacity style={{position: 'absolute', top: '0%', width: '95%', alignSelf: 'center', paddingVertical: 11, paddingHorizontal: 30, backgroundColor: '#119aa3', borderRadius: 20, textAlign: 'center'}} 
        onPress={()=>navigation.navigate("Checkout")}>
                <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 16}}>Continue (${authContext.rounded(authContext.cartSubTotal).toFixed(2)})</Text>
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