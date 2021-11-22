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

    
export default function ItemModal({item, selections}){
  const authContext = useContext(AuthContext);
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
      await authContext.setCartSubTotal(Number(preferenceSelections["quantity"]*Number(itemTotal)))
      var taxesTemp = 0;
      if ((Number(preferenceSelections["quantity"])*Number(itemTotal))<4){
        await authContext.setTaxes(((Number(preferenceSelections["quantity"])*Number(itemTotal))*0.05));
        taxesTemp = ((Number(preferenceSelections["quantity"])*Number(itemTotal))*0.05);
      } else{
        await authContext.setTaxes(((Number(preferenceSelections["quantity"])*Number(itemTotal))*0.13));
        taxesTemp = ((Number(preferenceSelections["quantity"])*Number(itemTotal))*0.13);
      }
      await setTip(Number(preferenceSelections["quantity"]*Number(itemTotal))).then(async (tip) => {
        await setPaymentMethod(Number(preferenceSelections["quantity"]*Number(itemTotal)), tip, taxesTemp);
      });
      authContext.updateCartRestaurant({info: item["restaurant_id"], restaurant: {name: item["restaurant_name"]}})
      setModalVisibles()
      //authContext.setCartRestaurantHours(route.params.times)
      authContext.setCartNumber(Number(preferenceSelections["quantity"]))
      // navigation.navigate("Search2", {screen: route.params.restaurant["name"], params: {restaurant: route.params.restaurant, itemsArr: itemArr, modals: modalsTemp}})
    } else{
        setDiffRestaurantCartPrompt(true)
        //setModalVisibles()
      // navigation.navigate("Search2", {screen: route.params.restaurant["name"], params: {restaurant: route.params.restaurant, itemsArr: itemArr, modals: modalsTemp}})
    }
    
  }

  const setTip = async (subtotal)=>{
    if (authContext.tipIndex === 0){
      await authContext.setTip(0);
      return 0
    } else if (authContext.tipIndex===1){
      await authContext.setTip(0.05 * subtotal)
      return (0.05 * subtotal)
    } else if (authContext.tipIndex===2){
      await authContext.setTip(0.1 * subtotal)
      return (0.1 * subtotal)
    } else if (authContext.tipIndex===3){
      await authContext.setTip(0.15 * subtotal)
      return (0.15 * subtotal)
    } else if (authContext.tipIndex===4){
      await authContext.setTip(0.18 * subtotal)
      return (0.18 * subtotal)
    }
  }

    const setPaymentMethod = async (subtotal, tip, taxes) =>{
    const paymentMethodTemp = authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? (authContext.defaultPaymentId=== undefined ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash';
    await authContext.setPaymentMethod(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? (authContext.defaultPaymentId=== undefined ? 'Please select a payment method' : 'Credit card') : 'Drinkly Cash')
    await authContext.setIcon(authContext.drinklyCashAmount===undefined || authContext.drinklyCashAmount < (subtotal + tip + taxes) || authContext.drinklyCash === false ? (authContext.defaultPaymentId=== undefined ? '' : 'credit-card') : 'cash')
    if (paymentMethodTemp === 'Drinkly Cash'){
      await authContext.setServiceFee(0);
    } else{
      await authContext.setServiceFee(0.15);
    }

  }

  const handleAddCartNew = async ()=>{
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
      await authContext.setCartSubTotal(Number(preferenceSelections["quantity"])*Number(itemTotal))
      await authContext.setCartNumber(preferenceSelections["quantity"])
      var taxesTemp = 0;
      if ((Number(preferenceSelections["quantity"])*Number(itemTotal))<4){
        await authContext.setTaxes((Number(preferenceSelections["quantity"])*Number(itemTotal)*0.05));
        taxesTemp = (Number(preferenceSelections["quantity"])*Number(itemTotal)*0.05);
      } else{
        await authContext.setTaxes((Number(preferenceSelections["quantity"])*Number(itemTotal)*0.13));
        taxesTemp = (Number(preferenceSelections["quantity"])*Number(itemTotal)*0.13);
      }
      await setTip(Number(preferenceSelections["quantity"])*Number(itemTotal)).then(async (tip) => {
        await setPaymentMethod(Number(preferenceSelections["quantity"])*Number(itemTotal), tip, taxesTemp);
      });
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
        <Text style={{marginTop: 5, color: '#44bec6', fontWeight: 'bold'}}>Required</Text>

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
              preferenceSelectionsTemp["preference_selections"][selection["name"]]["price"] = selection["prices"][i];
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
                {selection["prices"][i]=== 0 ? null : <Text style={{color: 'gray', marginTop: 5}}>+ ${authContext.rounded(selection["prices"][i]).toFixed(2)}</Text>}
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
                {selection["prices"][i]=== 0 ? null : <Text style={{color: 'gray', marginTop: 5}}>+ ${authContext.rounded(selection["prices"][i]).toFixed(2)}</Text>}
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
          preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["price"] = selection["prices"][i];
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
        preferenceSelectionsTemp["preference_selections"][String(selection["name"]+i)]["price"] = selection["prices"][i];
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
                {selection["prices"][i]=== 0 ? null : <Text style={{color: 'gray', marginTop: 5}}>+ ${authContext.rounded(selection["prices"][i]).toFixed(2)}</Text>}
              </View>
              <View style={{flexDirection: 'row', position: 'absolute', right: '2%'}}>
                {countPerSelection[i]>0 ? 
                <TouchableOpacity onPress = {()=>handleSubtract(i)}>
                  <MaterialCommunityIcons name="minus" size={16}/>
                </TouchableOpacity> : <MaterialCommunityIcons name="minus" size={16}/>}
                <Text style={{width: 20, textAlign: 'center'}}>{countPerSelection[i]}</Text>

                {countPerSelection[i]<9 && countSelected < 3 ? 
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
    <View style={{height: Dimensions.get("screen").height*0.95, }}>

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

      {pass === false ? <Text style={{position: 'absolute', width: '95%', backgroundColor: 'white', bottom: 80, color: 'red', padding: 10, paddingLeft: 20, borderRadius: 25}}>Please select required choices.</Text> : null}

      <TouchableOpacity onPress={()=>{
        const pass = checkRequired();
        if (pass===false){
          //console.log("CHECK REQUIRED")
        } else{
          handleAddCart();
          
          
        }
        }} style={{backgroundColor: '#119aa3', position: 'absolute', bottom: 50, width: '95%', alignSelf: 'center', padding: 10, borderRadius: 25}}><View style={{flexDirection: 'row', width: '100%'}}>
        <View style={{float: 'left'}}><Text style={{color: 'white', fontWeight: 'bold', fontSize: 17, left: 0}}>Quick checkout</Text></View>
        <View style={{float: 'right', position: 'absolute', right: '2%'}}><Text style={{color: 'white', fontWeight: 'bold', fontSize: 17, right: 0}}>${authContext.rounded(itemTotal*quantity).toFixed(2)}</Text></View>
        </View></TouchableOpacity>

      <Modal visible={diffRestaurantCartPrompt} transparent={true} animationType='slide'>
        <View style={{padding: 20, width: Dimensions.get("screen").width*0.95, backgroundColor: '#eff3f3', position: 'absolute', bottom: '12%', alignSelf: 'center', borderRadius: 15, shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 2, shadowOpacity: 0.5}}>
        <Text style={{textAlign: 'center'}}>You currently have other items in your cart. Would you like to quick checkout this item?</Text>
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
