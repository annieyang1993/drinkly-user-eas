import React, { useEffect, useState, useContext } from 'react';
import {TouchableHighlight, TouchableOpacity, ScrollView, SlideModal, Modal, TextInput, View, Text, StyleSheet, Dimensions, Image } from 'react-native'
import AuthContext from '../context/Context';
import {getDistance, getPreciseDistance} from 'geolib';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Firebase, db} from '../config/firebase';
import firebase from 'firebase'
import {useNavigation, StackActions} from '@react-navigation/native'
import { Button, InputField, ErrorMessage } from '../components/Index';

const auth = Firebase.auth();


function RestaurantPage({route}){
  const authContext = useContext(AuthContext);
  const [itemArr, setItemArr] = useState(route.params.itemsArr);
  const [modals, setModals] = useState(Object.values(route.params.modals));
  const [selections, setSelections] = useState({})
  const date = new Date()
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  const navigation = useNavigation();
  
  useEffect(()=>{
  }, [])

  const updateCartTotals=()=>{
        const itemTotalsTemp = [];
        authContext.cart.map((item, i)=>{
            var total = Number(item["details"]["price"]);
            if (!(item["preference_selections"]===undefined)){
                Object.values(item["preference_selections"]).map((preference, j)=>{
                    total+=Number(preference["price"])*Number(preference["quantity"])
                })
            }
            itemTotalsTemp.push(authContext.rounded(Number(total*item["quantity"])).toFixed(2));
        })
        authContext.setItemTotals(itemTotalsTemp);
  }

  const getItems=async()=>{
    const items = await Firebase.firestore().collection('restaurants').doc(`${route.params.restaurant["name"]}-${route.params.restaurant["street"][0]}-${route.params.restaurant["city"]}`).collection("items").get()
    items.docs.map((item,i)=>{
      const tempItems = itemArr;
      tempItems[item.data().name] = item.data();
      setItemArr(tempItems);
    })

  }

  const getSelections=async (item, j)=>{
    await setSelections({});
    const selectionsTemp = {};
    await Firebase.firestore()
    .collection('restaurants')
    .doc(`${route.params.restaurant["name"]}-${route.params.restaurant["street"][0]}-${route.params.restaurant["city"]}`)
    .collection('items')
    .doc(item).collection('add-ons').get().then(async (addons)=>{
      await addons.docs.map((addon, i)=>{
        selectionsTemp[addon.data().name]=addon.data();
      })
      setModalAtI(j)
    })
    setSelections(selectionsTemp);


    }

  const setModalVisibles = () => {
      const arr = [];
      Object.values(itemArr).map((ele, i)=>{
          arr.push(false);
      })
      setModals(arr);
      
  }

  const setModalAtI = (a)=>{
      const arr = [];
      Object.values(itemArr).map((ele, i)=>{
          if (i===a){
              arr.push(true);
          } else{
              arr.push(false);
          }
          
      })
      setModals(arr);
  }

  const updateModals=(name, bool)=>{
    var tempModal = modals;
    tempModal[name] = bool;
    setModals(tempModal);
    RenderContent();
  }

  const setWeekdayAndTimeArrays = async ()=>{
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

function ItemModal({item, selections}){
  const [itemPrice, setItemPrice] = useState(item["price"])
  const [requiredSelected, setRequiredSelected] = useState({})
  const [preferenceSelections, setPreferenceSelections] = useState({preference_selections: {}, quantity: 1})
  const [pass, setPass] = useState(true);
  const [diffRestaurantCartPrompt, setDiffRestaurantCartPrompt] = useState(false);
  const [specialInstructionsModal, setSpecialInstructionsModal] = useState({render: false});
  const [itemTotal, setItemTotal] = useState(item["price"])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [quantity, setQuantity] = useState(1);


    useEffect(()=>{
      var count = 0;
      Object.values(selections).map((ele, i)=>{
        if (ele["required"]===true){
          count+=1;
        }
      })
      if (count===0){
        setPass(true);
      }
    }, [])

  const updateItemTotal=()=>{
    var currentItemPrice = Number(item["price"]);
    Object.keys(preferenceSelections["preference_selections"]).map((selection, i)=>{
      if (!(selection==="special_instructions")){
        currentItemPrice+=Number(preferenceSelections["preference_selections"][selection]["quantity"])*Number(preferenceSelections["preference_selections"][selection]["price"])
      }

    })
    setItemTotal(currentItemPrice);
  }


  const handleAddCart = async ()=>{
    if (authContext.cart.length===0){
      const cartTemp = [];
      const index ={}
      index["name"] = item["name"];
      index["details"] = item;
      index["quantity"] = preferenceSelections["quantity"];
      index["preference_selections"] = preferenceSelections["preference_selections"];
      index["total_price"] = itemTotal;
      cartTemp.push(index);
      authContext.updateCart(cartTemp);
      var modalsTemp = {}
      Object.values(itemArr).map((item,i)=>{
        modalsTemp[item["name"]] = false;
      })
      authContext.setCartSubTotal((preferenceSelections["quantity"]*itemTotal))
      if ((preferenceSelections["quantity"]*itemTotal)<4){
        authContext.setTaxes(((preferenceSelections["quantity"]*itemTotal)*0.05));
      } else{
        authContext.setTaxes(((preferenceSelections["quantity"]*itemTotal)*0.13));
      }
      authContext.updateCartRestaurant({info: `${route.params.restaurant["name"]}-${route.params.restaurant["street"][0]}-${route.params.restaurant["city"]}`, restaurant: route.params.restaurant, modals: modalsTemp})
      setModalVisibles()
      authContext.setCartRestaurantItems(itemArr);
      authContext.setCartRestaurantHours(route.params.times)
      authContext.setCartNumber(preferenceSelections["quantity"])
      const discountsFirebase = await Firebase.firestore().collection('restaurants')
      .doc(`${route.params.restaurant["name"]}-${route.params.restaurant["street"][0]}-${route.params.restaurant["city"]}`)
      .collection('discounts').get()
      discountsTemp = {}
      discountsFirebase.docs.map((discount, n)=>{
        discountTemp = discount.data();
        discountsTemp[discountTemp["code"]] = discountTemp;
      })

      authContext.setDiscounts(discountsTemp);
      // navigation.navigate("Search2", {screen: route.params.restaurant["name"], params: {restaurant: route.params.restaurant, itemsArr: itemArr, modals: modalsTemp}})
    } else{
      if (authContext.cartRestaurant["info"]===`${route.params.restaurant["name"]}-${route.params.restaurant["street"][0]}-${route.params.restaurant["city"]}`){
        //handle if it's the same restaurant
        var added = false;
        const cartTemp = authContext.cart.map((x)=>x);
        cartTemp.map((cartItem, b)=>{
          if (cartItem["name"] === item["name"] && JSON.stringify(cartItem["preference_selections"])===JSON.stringify(preferenceSelections["preference_selections"])){
            cartTemp[b]["quantity"]= cartTemp[b]["quantity"]+preferenceSelections["quantity"];
            added = true;
          }
        })
        if (added === false){
          const index = {}
          index["name"] = item["name"];
          index["details"] = item;
          index["quantity"] = preferenceSelections["quantity"];
          index["preference_selections"] = preferenceSelections["preference_selections"];
          index["total_price"] = itemTotal;
          cartTemp.push(index);
        }
        authContext.updateCart(cartTemp);
        authContext.setCartSubTotal(authContext.cartSubTotal+(preferenceSelections["quantity"]*itemTotal))
        if ((authContext.cartSubTotal+(preferenceSelections["quantity"]*itemTotal))<4){
          authContext.setTaxes((authContext.cartSubTotal+(preferenceSelections["quantity"]*itemTotal))*0.05);
        } else{
          authContext.setTaxes((authContext.cartSubTotal+(preferenceSelections["quantity"]*itemTotal))*0.13);
        }
        setModalVisibles()
        authContext.setCartNumber(authContext.cartNumber+preferenceSelections["quantity"])
      } else{
        setDiffRestaurantCartPrompt(true)
        //setModalVisibles()
      }
       var modalsTemp = {}
      Object.values(itemArr).map((item,i)=>{
        modalsTemp[item["name"]] = false;
      })
      // navigation.navigate("Search2", {screen: route.params.restaurant["name"], params: {restaurant: route.params.restaurant, itemsArr: itemArr, modals: modalsTemp}})
    }
    
  }

  const handleAddCartNew = ()=>{
      const cartTemp = [];
      const index ={}
      index["name"] = item["name"];
      index["details"] = item;
      index["quantity"] = preferenceSelections["quantity"];
      index["preference_selections"] = preferenceSelections["preference_selections"];
      index["total_price"]=itemTotal;
      cartTemp.push(index);
      authContext.updateCart(cartTemp);
      var modalsTemp = {}
      Object.values(itemArr).map((item,i)=>{
        modalsTemp[item["name"]] = false;
      })
      authContext.updateCartRestaurant({info: `${route.params.restaurant["name"]}-${route.params.restaurant["street"][0]}-${route.params.restaurant["city"]}`, restaurant: route.params.restaurant, modals: modalsTemp})
      setModalVisibles()
      authContext.setCartRestaurantItems(itemArr);
      authContext.setCartRestaurantHours(route.params.times)
      authContext.setCartNumber(preferenceSelections["quantity"])
      authContext.setCartSubTotal(preferenceSelections["quantity"]*itemTotal)
      if ((preferenceSelections["quantity"]*itemTotal)<4){
        authContext.setTaxes(((preferenceSelections["quantity"]*itemTotal)*0.05));
      } else{
        authContext.setTaxes(((preferenceSelections["quantity"]*itemTotal)*0.13));
      }
      // navigation.navigate("Search2", {screen: route.params.restaurant["name"], params: {restaurant: route.params.restaurant, itemsArr: itemArr, modals: modalsTemp}})
    
  } 

  const checkRequired=()=>{
    var passTemp = true;
    Object.values(selections).map((selection, i)=>{
      if ((selection["required"]===true && requiredSelected[i]===false) || selection["required"]===true && requiredSelected[i]===undefined){
        passTemp = false;
      }
    })
   setPass(passTemp)
    return passTemp;
    
  }
  function RequiredSelection({selection, index}){
    const [selected, setSelected] = useState(new Array(selection["choices"].length).fill(false))

    useEffect(()=>{
      setPresets();
    }, [])
    
    const setPresets = () => {
      const selectedTemp = selected.map((x)=>x);
      selection["choices"].map((choice, j)=>{
        if (!(preferenceSelections["preference_selections"]===undefined)){
          if (!(preferenceSelections["preference_selections"][selection["name"]]===undefined)){
            if (choice===preferenceSelections["preference_selections"][selection["name"]]["choice"]){
              selectedTemp[j] = true;
            }
          }

        }

      })
      setSelected(selectedTemp);
      
    }
    return(
      <View style={{marginBottom: 20}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 20}}>{selection["name"]}</Text>
        <View style={{flexDirection: 'row'}}>
        {selection["number"] === 1 ? <Text style={{marginTop: 5, color: 'gray'}}>Select 1 - </Text> : <Text style={{marginTop: 5, color: 'gray'}}>Select {selection["number"]} - </Text>}
        <Text style={{marginTop: 5, color: 'red', fontWeight: '500'}}>Required</Text>

        </View>
        {selection["choices"].map((choice, i)=>{
          return(
            <TouchableHighlight underlayColor='white' key={i} 
            onPress={()=>{
              const selectedTemp = new Array(selection["choices"].length).fill(false)
              selectedTemp[i] = true;
              setSelected(selectedTemp)
              const preferenceSelectionsTemp = preferenceSelections;
              if (preferenceSelectionsTemp["preference_selections"]=== undefined){
                preferenceSelectionsTemp["preference_selections"]={};
              } 
              preferenceSelectionsTemp["preference_selections"][selection["name"]]={}
              preferenceSelectionsTemp["preference_selections"][selection["name"]]["name"] = selection["name"];
              preferenceSelectionsTemp["preference_selections"][selection["name"]]["choice"] = selection["choices"][i];
              preferenceSelectionsTemp["preference_selections"][selection["name"]]["price"] = Number(selection["prices"][i]);
              preferenceSelectionsTemp["preference_selections"][selection["name"]]["quantity"] = 1;
              preferenceSelectionsTemp["preference_selections"][selection["name"]]["required"] = true;
              setPreferenceSelections(preferenceSelectionsTemp)
              const requiredSelectedTemp = requiredSelected
              requiredSelectedTemp[index] = true;
              setRequiredSelected(requiredSelectedTemp);
              updateItemTotal();
              
            }} style={{flexDirection: 'row', marginTop: 10}}>
              <View style={{flexDirection: 'row', width: '100%'}}>
              <View style={{height: 20, width: 20, borderRadius: 10, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center'}}>
                {selected[i] == true? <View style={{height: 12, width: 12, borderRadius: 6, backgroundColor: 'black'}}></View> : null}
              </View>
              <View style={{width: '100%'}}>
                <Text style={{marginLeft: 10, fontSize: 16}}>{choice}</Text>
                {selection["prices"][i]=== 0 ? null : <Text style={{color: 'gray', marginTop: 5}}>+ ${authContext.rounded(Number(selection["prices"][i])).toFixed(2)}</Text>}
              </View>
              </View>
            </TouchableHighlight>
          )       
        }
        )}

      </View>
    )
  }

  function OptionalSelectionWithoutRepeat({selection}){
    const [selected, setSelected] = useState(new Array(selection["choices"].length).fill(false))
    const [countSelected, setCountSelected] = useState(0);
    return(
      <View style={{marginBottom: 20}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 20}}>{selection["name"]}</Text>
        <View style={{flexDirection: 'row'}}>
        {selection["number"] === 1 ? <Text style={{marginTop: 5, color: 'gray'}}>Select 1 </Text> : <Text style={{marginTop: 5, color: 'gray'}}>Select up to {selection["number"]} </Text>}
        </View>
        {selection["choices"].map((choice, i)=>{
          return(
            <TouchableHighlight underlayColor='white' key={i} 
            onPress={()=>{
              const selectedTemp = selected.map((x)=>x)
              const name = String(selection["name"]+i);
              const preferenceSelectionsTemp = preferenceSelections;
              if (selected[i]===false && countSelected<selection["number"]){
                selectedTemp[i] = true;
                setCountSelected(countSelected+1)
                if (preferenceSelectionsTemp["preference_selections"]=== undefined){
                  preferenceSelectionsTemp["preference_selections"]={};
                } 
                preferenceSelectionsTemp["preference_selections"][name]["name"] = selection["name"];
                preferenceSelectionsTemp["preference_selections"][name]["choice"] = selection["choices"][i];
                preferenceSelectionsTemp["preference_selections"][name]["price"] = selection["prices"][i];
                preferenceSelectionsTemp["preference_selections"][selection["name"]]["quantity"] = 1;
                preferenceSelectionsTemp["preference_selections"][selection["name"]]["required"] = false;
              } else if (selected[i]===true){
                selectedTemp[i] = false;
                delete preferenceSelectionsTemp["preference_selections"][name]
                setCountSelected(countSelected-1)
              }
              setSelected(selectedTemp)
              setPreferenceSelections(preferenceSelectionsTemp)
              updateItemTotal();
            }} style={{flexDirection: 'row', marginTop: 10}}>
              <View style={{flexDirection: 'row', width: '100%'}}>
              <View style={{height: 18, width: 18, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center'}}>
                {selected[i] == true? <View style={{height: 10, width: 10, backgroundColor: 'black'}}></View> : null}
              </View>
              <View style={{width: '100%'}}>
                <Text style={{marginLeft: 10, fontSize: 16}}>{choice}</Text>
                {selection["prices"][i]=== 0 ? null : <Text style={{color: 'gray', marginTop: 5}}>+ ${authContext.rounded(Number(selection["prices"][i])).toFixed(2)}</Text>}
              </View>
              </View>
            </TouchableHighlight>
          )       
        }
        )}

      </View>
    )
  }

  function OptionalSelectionWithRepeat({selection}){
    const [selected, setSelected] = useState(new Array(selection["choices"].length).fill(false))
    const [countPerSelection, setCountPerSelection] = useState(new Array(selection["choices"].length).fill(0))
    const [countSelected, setCountSelected] = useState(0);

    useEffect(()=>{
      setPresets();
    }, [])
    
    const setPresets = () => {
      const countPerSelectionTemp = countPerSelection.map((x)=>x)
      var countTemp = 0
      selection["choices"].map((choice, j)=>{
        if (!(preferenceSelections["preference_selections"]===undefined)){
          Object.values(preferenceSelections["preference_selections"]).map((preference, k)=>{
            if (choice===preference["choice"] && selection["name"]===preference["name"]){
              countPerSelectionTemp[j]=preference["quantity"]
              countTemp+=preference["quantity"]
            }
          })
        }

      })
      setCountSelected(countTemp);
      setCountPerSelection(countPerSelectionTemp);
      
    }

    const handleSubtract = (i) =>{
      if (countPerSelection[i]>0){
        const countPerSelectionTemp = countPerSelection.map((x)=>x);
        countPerSelectionTemp[i]-=1;
        if (countPerSelection[i]>1){
          const preferenceSelectionsTemp = preferenceSelections;
          if (preferenceSelectionsTemp["preference_selections"]=== undefined){
            preferenceSelectionsTemp["preference_selections"]={};
          } 
          preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["name"] = selection["name"];
          preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["choice"] = selection["choices"][i];
          preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["price"] = Number(selection["prices"][i]);
          preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["quantity"] = countPerSelection[i]-1;
          preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["required"] = false;
          setPreferenceSelections(preferenceSelectionsTemp);
        } else if (countPerSelection[i]===1){
          const preferenceSelectionsTemp = preferenceSelections;
          delete preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)];
          setPreferenceSelections(preferenceSelectionsTemp);
        }
        setCountPerSelection(countPerSelectionTemp);
        setCountSelected(countSelected-1);
      }
      updateItemTotal();

    }

    const handleAdd = (i) => {
      if (countPerSelection[i]<9){
        const countPerSelectionTemp = countPerSelection.map((x)=>x);
        countPerSelectionTemp[i]+=1;
        setCountPerSelection(countPerSelectionTemp)
        setCountSelected(countSelected+1);
        const preferenceSelectionsTemp = preferenceSelections;
        if (preferenceSelectionsTemp["preference_selections"]=== undefined){
          preferenceSelectionsTemp["preference_selections"]={};
        } 
        preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]={}
        preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["name"] = selection["name"];
        preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["price"] = Number(selection["prices"][i]);
        preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["quantity"] = countPerSelection[i]+1;
        preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["choice"] = selection["choices"][i];
        preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["required"] = false
        setPreferenceSelections(preferenceSelectionsTemp);
      }
      updateItemTotal();

    }
    return(
      <View style={{marginBottom: 20}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 20}}>{selection["name"]}</Text>
        <View style={{flexDirection: 'row'}}>
        {selection["number"] === 1 ? <Text style={{marginTop: 5, color: 'gray'}}>Select 1 </Text> : <Text style={{marginTop: 5, color: 'gray'}}>Select up to {selection["number"]} </Text>}
        </View>
        {selection["choices"].map((choice, i)=>{
          return(
              <View style={{flexDirection: 'row', width: '100%', marginTop: 10}} key={i}>
              <View style={{width: '100%'}}>
                <Text style={{fontSize: 16}}>{choice}</Text>
                {selection["prices"][i]=== 0 ? null : <Text style={{color: 'gray', marginTop: 5}}>+ ${authContext.rounded(Number(selection["prices"][i])).toFixed(2)}</Text>}
              </View>
              <View style={{flexDirection: 'row', position: 'absolute', right: '2%'}}>
                {countPerSelection[i]>0 ? 
                <TouchableOpacity onPress = {()=>handleSubtract(i)}>
                  <MaterialCommunityIcons name="minus" size={16}/>
                </TouchableOpacity> : <MaterialCommunityIcons name="minus" size={16}/>}
                <Text style={{width: 20, textAlign: 'center'}}>{countPerSelection[i]}</Text>

                {countPerSelection[i]<9 && countSelected < selection["number"] ? 
                <TouchableOpacity onPress={()=>handleAdd(i)}>
                  <MaterialCommunityIcons name="plus" size={16}/>
                </TouchableOpacity> : <MaterialCommunityIcons name="plus" size={16}/>}
              </View>
              </View>
          )       
        }
        )}

      </View>
    )
  }

  function Preferences(){
    const [specialPreferencesInner, setSpecialPreferencesInner] = useState(preferenceSelections["preference_selections"]["special_instructions"])

    useEffect(()=>{
      setPresets();
    }, [])
    
    const setPresets = () => {
      if (!preferenceSelections["preference_selections"]===undefined){
        if (!(preferenceSelections["preference_selections"]["special_instructions"]===undefined)){
          setSpecialPreferencesInner(preferences["special_instructions"])
        }
      }

      
    }
    return(
    <View>
    <InputField
            inputStyle={{
              fontSize: 14
            }}
            containerStyle={{
              backgroundColor: '#fff',
              float: 'left',
              width: '100%',
              height: 40,
              //backgroundColor: "#efeeee",
              borderRadius: 5,
              paddingVertical: 10,
              marginVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: 'lightgray'
    

            }}
            placeholder='Add Special Instructions'
            keyboardType='default'
            autoFocus={false}
            value={specialPreferencesInner ? specialPreferencesInner : ''}
            onChangeText={text => {
              setSpecialPreferencesInner(text)
              const preferenceSelectionsTemp = preferenceSelections
              if (preferenceSelectionsTemp["preference_selections"]=== undefined){
                preferenceSelectionsTemp["preference_selections"]={};
              } 
              preferenceSelectionsTemp["preference_selections"]["special_instructions"]=text
              if (text==='' || text===' '){
                delete preferenceSelectionsTemp["preference_selections"]["special_instructions"]
              }
              setPreferenceSelections(preferenceSelectionsTemp)}}
              
            maxLength={150}
          />
    </View>)
  }

  function Quantity(){
    return(
      <View style={{alignSelf: 'center', margin: 50, flexDirection: 'row', padding: 10, borderColor: 'lightgray', borderWidth: 1, borderRadius: 25}}>
        {quantity===1 ? 
        <MaterialCommunityIcons name="minus" size={20} style={{marginRight: 30, color: 'lightgray'}}/> : 
        <TouchableOpacity onPress={()=>{setQuantity(quantity-1);
        const preferenceSelectionsTemp = preferenceSelections;
        preferenceSelectionsTemp["quantity"] = quantity - 1;
        setPreferenceSelections(preferenceSelectionsTemp)}}><MaterialCommunityIcons name="minus" size={20} style={{marginRight: 30, color: 'black'}}/></TouchableOpacity>}
        
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>{quantity}</Text>
        <TouchableOpacity onPress={()=>{setQuantity(quantity+1); 
        const preferenceSelectionsTemp = preferenceSelections;
        preferenceSelectionsTemp["quantity"] = quantity + 1;
        setPreferenceSelections(preferenceSelectionsTemp)}}><MaterialCommunityIcons name="plus" size={20} style={{marginLeft: 30, color: 'black'}}/></TouchableOpacity>
      </View>
    )

  }

  return (
    <View style={{height: Dimensions.get("screen").height*0.95}}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {item["img"]=== undefined ? <View style={{height: 20, width: '100%'}}></View> :
      <Image style = {{height: 250, borderRadius: 20}} source={{uri: item["img"]}}/>}
        <View style={{padding: 20}}>
          <Text numberOfLines={1} style={{fontSize: 20, fontWeight: 'bold', }}>{item["name"]}</Text>
          <Text numberOfLines={2} style={{fontSize: 15, color: 'gray'}}>{item["description"]}</Text>
        </View> 

        {Object.values(selections).length === 0 ? null : <View style={{borderColor: 'lightgray', borderWidth: 1, backgroundColor: '#e9e7e7', width: '100%', height: 7}}></View>}                            
        <View style={{padding: 20}}>


          {Object.values(selections).map((selection, i)=>{
            if (selection["required"]===true){
              return(<RequiredSelection key={i} selection={selection} index={i}/>)
            } else{
              return(<OptionalSelectionWithRepeat key={i} selection={selection}/>)
            }
            
          })}

        <View style={{borderColor: 'lightgray', borderWidth: 1, backgroundColor: '#e9e7e7', width: Dimensions.get("screen").width, height: 5, marginLeft: -20}}></View>                            

          <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 20}}>Preferences</Text>
          <Preferences/>
          <Text style={{color: 'gray', fontSize: 11, marginTop: 10, marginLeft: 10}}>Store will contact you if item is unavailable.</Text>
          <Quantity/>
          <View style={{height: 200, width: 200}}></View>
        </View>    
      </ScrollView>

      {pass === false ? <Text style={{position: 'absolute', bottom: 80, color: 'red', padding: 10, paddingLeft: 20, borderRadius: 25, width: '95%', backgroundColor: 'white'}}>Please select required choices.</Text> : null}

      <TouchableOpacity onPress={()=>{
        const pass = checkRequired();
        if (pass===false){
        } else{
          handleAddCart();
          
          
        }
        }} style={{backgroundColor: '#119aa3', position: 'absolute', bottom: 50, width: '95%', alignSelf: 'center', padding: 10, borderRadius: 25}}><View style={{flexDirection: 'row', width: '100%'}}>
        <View style={{float: 'left'}}><Text style={{color: 'white', fontWeight: 'bold', fontSize: 17, left: 0}}>Update cart</Text></View>
        <View style={{float: 'right', position: 'absolute', right: '2%'}}><Text style={{color: 'white', fontWeight: 'bold', fontSize: 17, right: 0}}>${authContext.rounded(Number(itemTotal*quantity)).toFixed(2)}</Text></View>
        </View></TouchableOpacity>

      <Modal visible={diffRestaurantCartPrompt} transparent={true} animationType='slide'>
        <View style={{padding: 20, width: Dimensions.get("screen").width*0.95, backgroundColor: '#eff3f3', position: 'absolute', bottom: '12%', alignSelf: 'center', borderRadius: 15, shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 2, shadowOpacity: 0.5}}>
        <Text style={{textAlign: 'center'}}>You currently have items from another restaurant in your cart. Would you like to start a new cart?</Text>
        <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 10}}>
          <TouchableOpacity 
          
          onPress={()=>{
            authContext.updateCart([]);
            authContext.updateCartRestaurant();
            handleAddCartNew();
            setModalVisibles();
            setDiffRestaurantCartPrompt(false);
            
            }}><View style={{marginHorizontal: 10, padding: 5, backgroundColor: '#119aa3', borderRadius: 5, paddingHorizontal: 10}}><Text style={{color: 'white', fontWeight: 'bold'}}>Yes</Text></View></TouchableOpacity>
          <TouchableOpacity onPress={()=>{setDiffRestaurantCartPrompt(false)}}><View style={{marginHorizontal: 10, padding: 5, backgroundColor: '#119aa3', borderRadius: 5, paddingHorizontal: 10}}><Text style={{color: 'white', fontWeight: 'bold'}}>No</Text></View></TouchableOpacity>
        </View>
        </View>
      </Modal>

    </View>
  )
  }

  function RenderContent(){
    return(
      <View>
        {route.params.restaurant["sections"].map((section, i) =>{
          return (
          <View key={section}>
            <View style={{marginHorizontal: 10, paddingVertical: 20}}>
              <Text style={{fontSize: 17, fontWeight: 'bold', marginTop: 20}}>{section}</Text>
            </View>
            {Object.values(itemArr).map((item, i)=>{
              if (item["section"]===section){
                return(
                <View key={item["name"]}>
                  <TouchableOpacity onPress={async ()=>{
                    getSelections(item["name"], i)
                    }
                    
                  }>
                  {item["img"]!==undefined ? 
                  <View style={{width: '100%', height: 100, flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                    <View style={{width: '70%', marginRight: '2%'}}>
                      <Text key={item["name"]} style={{fontSize: 15, fontWeight: 'bold', marginTop: 5}} numberOfLines={1}>{item["name"]}</Text>
                      <Text style={{color: 'gray', fontSize: 14, marginBottom: 5}} numberOfLines={2}>{item["description"]}</Text>
                      <Text>${authContext.rounded(Number(item["price"])).toFixed(2)}</Text>
                    </View>
                    <Image style={{width: '28%', height: '95%', borderRadius: 5}} source={{uri: item["img"]}}/>
                  </View> : 
                  <View style={{width: '100%', height: 100, flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                    <View style={{width: '100%', marginRight: '2%'}}>
                      <Text key={item["name"]} style={{fontSize: 15, fontWeight: 'bold', marginTop: 5}} numberOfLines={1}>{item["name"]}</Text>
                      <Text style={{color: 'gray', fontSize: 14, marginBottom: 5}} numberOfLines={2}>{item["description"]}</Text>
                      <Text>${authContext.rounded(Number(item["price"])).toFixed(2)}</Text>
                    </View>
                  </View>}

                  </TouchableOpacity>
                  <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modals[i]}
                        onRequestClose={() => {
                            // this.closeButtonFunction()
                        }}>
                        <View
                            style={{
                            height: '95%',
                            marginTop: 'auto',
                            backgroundColor:'white',
                            borderRadius: 20,
                            paddingTop: 10
                            }}>
                            
                            <TouchableOpacity
                            style={{backgroundColor: 'white',
                            borderRadius: 10,
                            position: 'absolute',
                            margin: 10,
                            zIndex: 50,
                            }}
                            onPress={() => {
                                setModalVisibles();
                            }}>
                            <Text style={{
                            alignSelf: 'center',
                            textAlign: 'center',
                            fontSize: 15, padding: 5}}><MaterialCommunityIcons name="close" size={25}/></Text>
                            </TouchableOpacity>
                            <View>
                              <ItemModal item={item} selections={selections}/>
                            </View>
                        </View>
                        
                    </Modal>
                </View>)
              }
            })}
          </View>)
        })}

      </View>
    )
  }

  const saveRestaurant = async () =>{
    
    const savedObjectTemp = authContext.savedRestaurantsObject;
    savedObjectTemp[`${String(route.params.restaurant["name"])}-${String(route.params.restaurant["street"][0])}-${String(route.params.restaurant["city"])}`] = route.params.restaurant;
    await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
      saved: Object.keys(savedObjectTemp)
    }, {merge: true})
    authContext.setSavedRestaurants(Object.keys(savedObjectTemp));
    authContext.setSavedRestaurantsObject(savedObjectTemp);


  }

  const unsaveRestaurant = async () =>{
    const savedObjectTemp = authContext.savedRestaurantsObject;
    delete savedObjectTemp[`${String(route.params.restaurant["name"])}-${String(route.params.restaurant["street"][0])}-${String(route.params.restaurant["city"])}`];
    await Firebase.firestore().collection('users').doc(authContext.user.uid).set({
      saved: Object.keys(savedObjectTemp)
    }, {merge: true})
    authContext.setSavedRestaurants(Object.keys(savedObjectTemp));
    authContext.setSavedRestaurantsObject(savedObjectTemp);

  }
  

  return (
    <View>
      <Image style = {{height: 200, borderRadius: 20, marginTop: -50}} source={{uri: route.params.restaurant["pictures"][0]}}/>
      <View style={{height: Dimensions.get("screen").height, marginTop: 80, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 20, width: '100%', backgroundColor: 'white', position: 'absolute'}}>
      <ScrollView showsVerticalScrollIndicator={false} >
        <View style={{marginHorizontal: 10}}><Text style={{fontSize: 22, fontWeight: 'bold'}}>{route.params.restaurant["name"]}</Text></View>

        <View style={{flexDirection: 'row'}}>
        <View style={{width: '85%'}}>
        <Text style={{fontSize: 13, marginTop: 5, color: 'gray', marginHorizontal: 10}}>{route.params.restaurant["street"][0]}, {route.params.restaurant["city"]}, {route.params.restaurant["state"]}</Text>
        <Text style={{fontSize: 13, marginTop: 5, color: 'gray', marginHorizontal: 10}}>Operating hours: {route.params.times[weekdays[date.getDay()]]["open"]} - {route.params.times[weekdays[date.getDay()]]["close"]}</Text>        
        </View>

      {authContext.savedRestaurants.includes(`${String(route.params.restaurant["name"])}-${String(route.params.restaurant["street"][0])}-${String(route.params.restaurant["city"])}`) ? 
        <TouchableOpacity onPress={()=>unsaveRestaurant()} style={{width: '14%', marginTop: 7, alignItems: 'center', opacity: 0.8, fontWeight: 'bold'}}>
          <MaterialCommunityIcons name="bookmark" color={'#119aa3'} size={20}/>
          <Text style={{fontSize: 13, color: '#119aa3'}}>Saved</Text>
        </TouchableOpacity> : 
        <TouchableOpacity onPress={()=>saveRestaurant()} style={{width: '14%', marginTop: 7, alignItems: 'center', opacity: 0.8, fontWeight: 'bold'}}>
          <MaterialCommunityIcons name="bookmark-outline" color={'#119aa3'} size={20}/>
          <Text style={{fontSize: 13, color: '#119aa3'}}>Save</Text>
        </TouchableOpacity>}
      </View>
        <RenderContent/>
        <View style={{height: 200}}></View>
      </ScrollView>
      </View>
      <TouchableOpacity onPress={()=>{updateCartTotals(); navigation.navigate("Cart", {back: route.params.restaurant["name"]})}}style={{marginTop: 40, marginLeft: 10, position: 'absolute', padding: 5}}><MaterialCommunityIcons name="arrow-left" color={'white'} size={25}/></TouchableOpacity>
      

    </View>

  )}

const styles = StyleSheet.create({
    restaurantContainer: {
        padding: 10
    },

    closeButton: {
        margin: 10, 
        fontWeight: 'bold', 
        fontSize: 15, 
        zIndex: 30, 
        backgroundColor: 'white',
        width: 20,
        textAlign: 'center',
        borderRadius: 20
    },

    addButton: {
        zIndex: 40
    },
    modalContainer: {
        height: "100%",
        width: "100%",
        backgroundColor: "white",
        zIndex: 20
    },

    headerImg: {
        width: "100%",
        height: 200,
        alignSelf: 'center',
        borderRadius: 30,
        marginBottom: 20,

    },

    footer: {
        position: 'absolute',
        top: 0
    },

    itemCardContainer: {
        width: "95%",
        alignSelf: 'center',
        flexDirection: 'row',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
        paddingTop: 10,
        paddingBottom: 10
        
    },

    itemCardName: {
        fontSize: 16,
        fontWeight: 'bold'
    },

    itemCardImg: {
        height: 90,
        width: "25%",
        padding: 10
    },

    itemCardTextContainer: {
        width: "72%",
        marginRight: 10,
    },

    itemCardDescription: {
        color: '#535454'
    },

    itemCardPrice: {
        marginTop: 20
    },

    pickUp: {
        marginLeft: 10,
        //marginBottom: 20,
        width: "40%",
        marginTop: 10       
    },

    address: {
        margin: 10,
        marginBottom: 20,
        width: "100%",
        textAlign: 'left',
        
    },

    name: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
        marginHorizontal: 10
    },

    itemImg: {
        width: "100%",
        height: 300,
        borderRadius: 20,
        zIndex: 50
    },

    quantityContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        fontSize: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: 'black',
        borderWidth: 1,
        marginVertical: 20

        
    },

    quantityStyle: {
        fontSize: 27,
        fontWeight: 'bold',
        padding: 5,
        paddingHorizontal: 15,
        width: 50,
        textAlign: 'center'
    },

    activeChange: {
        fontSize: 27,
        fontWeight: 'bold',
        padding: 5,
        paddingHorizontal: 15,
        color: '#a9133d',
        width: 50,
        textAlign: 'center'
    },

    inactiveChange: {
        fontSize: 27,
        fontWeight: 'bold',
        padding: 5,
        paddingHorizontal: 15,
        color: '#797b7b',
        width: 50,
        textAlign: 'center'
    },

    addToCartButton: {
        backgroundColor: '#c11c37',
        width: "95%",
        alignSelf: 'center',
        borderRadius: 25,
        height: 50,
        textAlign: 'center',
        flexDirection: 'row',
        position: 'absolute',
        top: "5%"
    },

    addToCart: {
        alignSelf: 'center', 
        padding: 10, 
        fontSize: 20, 
        color: 'white', 
        fontWeight: 'bold',
        position: 'absolute',
        left: '5%'
    },

    totalPrice: {
        alignSelf: 'center', 
        padding: 10, 
        fontSize: 20, 
        color: 'white', 
        fontWeight: 'bold',
        position: 'absolute',
        right: "5%"
    }

  

})
export default RestaurantPage