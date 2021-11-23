import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {Modal, Image, TouchableOpacity, ImageBackground, ScrollView, Dimensions, StyleSheet, Text, View } from 'react-native';
import {Firebase, db} from '../config/firebase';
import ItemModal from '../pages/HomeItemModal'
import AuthContext from '../context/Context'
//import CachedImage from 'react-native-expo-cached-image'

export default function HomeNavigation({navigation}){
    const authContext = useContext(AuthContext);
    const [itemModal, setItemModal] = useState(false);
    const [item, setItem] = useState({});
    const [selections, setSelections] = useState({});

    const getSelections=async (item2)=>{
      setItem(item2);
      setSelections({});
      await Firebase.firestore()
      .collection('restaurants')
      .doc(item2["restaurant_id"])
      .collection('items')
      .doc(item2["name"]).collection('add-ons').get().then(async (addons)=>{
      const selectionsTemp = selections;
      await addons.docs.map((addon, i)=>{
        selectionsTemp[addon.data().name]=addon.data();
      })
      setSelections(selectionsTemp);
    })


    }

    const getItems=async(ele)=>{
    const items = await Firebase.firestore().collection('restaurants').doc(ele).collection("items").get()
    var tempItems = {}
    var modals = {}
    items.docs.map((item,i)=>{
      tempItems[item.data().name] = item.data();
      modals[item.data().name] = false;
    })
    const times = await Firebase.firestore().collection('restaurants').doc(ele).collection("operating hours").get()
    var tempTimes = {};
    times.docs.map((day, i)=>{
      tempTimes[day.id]=day.data();
    })
    return {tempItems, modals, tempTimes};

    }
    const setWeekdayAndTimeArrays = async ()=>{
      authContext.setPrevScreen("Points")
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


    return(
        <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={{width: '100%', alignSelf: 'center'}}>
            <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: 10, marginHorizontal: 20, marginTop: 50}}>Home</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: 'white', height: '100%'}}>
                <Text style={{fontWeight: 'bold', fontSize: 17, marginBottom: 10, marginHorizontal: 20, marginTop: 10}}>Discounts and rewards</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{flexDirection: 'row', height: 100, width: '100%', alignSelf: 'flex-end'}}>
                    {Object.keys(authContext.pointsList).map((reward, j)=>{
                        if (authContext.pointsList[reward]["rewards"]>=1){
                            return(
                                <View key={j} style={{margin: 5, marginLeft: 15, height: 75, width: 150, borderRadius: 15, backgroundColor: '#bdeaed', padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#44bec6', borderStyle: 'dashed'}}>
                                    <Text numberOfLines={1} style={{alignSelf: 'center', marginBottom: 5}}>{authContext.pointsList[reward]["restaurant_name"]}</Text>
                                    <MaterialCommunityIcons name="ticket" color={'#44bec6'} size={30}/>
                                </View>
                            )
                        }
                    })}
                    <View style={{margin: 5, marginLeft: 15, height: 75, width: 150, borderRadius: 15, backgroundColor: '#ecefef', padding: 10, alignItems: 'center'}}>
                        <Text numberofLines={3} style={{fontSize: 12.5, color: '#acadad', alignSelf: 'center', width: 130, height: 60, textAlign: 'center', marginBottom: 5}}>Save cafes or purchase items to see more discount codes.</Text>
                    </View>

                </ScrollView>

                {/* <Text style={{fontWeight: 'bold', fontSize: 17, marginBottom: 10, marginHorizontal: 20, marginTop: 10}}>Quick checkout items</Text>

                <View>
                {authContext.quickCheckoutList.length === 0 ? 
                <View><Text style={{marginHorizontal: 20, color: 'gray', width: '80%', marginBottom: 50}}>Purchase drinks to see a personalized quick checkout selection.</Text></View> : 
                
                <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '95%', alignSelf: 'center'}}>

                {authContext.quickCheckoutList.map((x)=>x).reverse().map((item2, j)=>{
                  return(<View key={j} style={{width: '45%', marginHorizontal: '2.5%'}}>
                    <TouchableOpacity onPress={async()=>{await getSelections(authContext.quickCheckoutObject[item2]).then(setItemModal(true))}} style={{backgroundColor: 'white', width: '100%', marginVertical: 10, padding: 5, borderRadius: 20, alignSelf: 'flex-start', shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 5, shadowOpacity: 0.6,}}>
                          <ImageBackground style={{width: '100%', height: 120, borderRadius: 20}} imageStyle={{padding: 20, borderRadius: 10}} resizeMode='cover' source={{uri: authContext.quickCheckoutObject[item2]["img"]}}>
                            <Text style={{margin: 10, marginTop: 50, textAlign: 'center', fontSize: 16, color: 'lightgray', fontWeight: 'bold', shadowColor: 'black', shadowOffset: {width: 1, height: 0}, shadowRadius: 1, shadowOpacity: 1,}}>{authContext.quickCheckoutObject[item2]["restaurant_name"]}</Text>
                          </ImageBackground>

                  </TouchableOpacity>                          
                  <Text numberOfLines={1} style={{textAlign: 'center', fontSize: 15}}>{item2}</Text>
                  </View>)
                })}
                                        </View> }
                </View> */}
                <View>

                <Text style={{fontWeight: 'bold', fontSize: 17, marginBottom: 10, marginHorizontal: 20, marginTop: 20}}>Saved cafes
                </Text>

                {authContext.savedRestaurants.length === 0 ? 
                
                <View>
                
                <Image style = {{width: '70%', resizeMode: 'contain', alignSelf: 'center', marginTop: 0, maxHeight: 300, opacity: 0.2, marginTop: 50}} source={require("../assets/home-page-icon.png")}/>
                <Text style={{marginHorizontal: 20, color: 'gray', fontSize: 15, alignSelf: 'center', opacity: 0.7}}>Save cafes to see here.</Text> 
                </View>: 
                <View>
                    {authContext.savedRestaurants.map((name, j)=>{
                        if (authContext.savedRestaurantsObject[name]!==undefined){

                                // onPress={async () => {
                                // //const arr = getItems(name);
                                // //console.log(ele)
                                // getItems(ele).then((items) => navigation.navigate(String(ele["name"]), {restaurant: ele, itemsArr: items.tempItems, modals: items.modals, times: items.tempTimes}));
                                // }}style={styles.restaurantCard}
                            return(
                                <View key={j} style={{borderRadius: 10, shadowColor: 'gray', shadowOffset: {width: 3, height: 3}, shadowRadius: 5, shadowOpacity: 0.6,}}>
                                    <TouchableOpacity title="restaurant" underlayColor="#f4f3f3" style={styles.restaurantCard}
                                    onPress={async () => {
                                    getItems(name).then((items) => navigation.navigate("Restaurant Page", {restaurant: authContext.savedRestaurantsObject[name], itemsArr: items.tempItems, modals: items.modals, times: items.tempTimes}));
                                    }}>
                                        <View >
                                        <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.restaurantTitle}>{authContext.savedRestaurantsObject[name]["name"]}</Text>
                                        </View>
                                        <Text numberOfLines={1} style={styles.restaurantDescription}>{authContext.savedRestaurantsObject[name]["description"]}</Text>
                                        <View style={styles.imageRow}>
                                        <Image style = {styles.restaurantImage} source={{uri: authContext.savedRestaurantsObject[name]["pictures"][0]}}/>
                                        <Image style = {styles.restaurantImage} source={{uri: authContext.savedRestaurantsObject[name]["pictures"][1]}}/>
                                        </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    })

                    }
                <View style={{height: 200, width: '100%'}}>
                </View>
                    
                </View>}
                </View>

            </ScrollView>
            </View>
             

        <Modal visible={itemModal} backgroundColor='white' animationType='slide' style={{zIndex: 500}}>
            <View style={{height: '95%', width: '100%', backgroundColor: 'white', position: 'absolute', bottom: '0%'}}>
            <ItemModal item={item} selections={selections}/>
            </View>
                <TouchableOpacity
                    style={{backgroundColor: 'white',
                    borderRadius: 10,
                    position: 'absolute',
                    margin: 10,
                    marginHorizontal: 20,
                    zIndex: 50,
                    marginTop: 50
                    }}
                    onPress={async () => {
                        await setItem({});
                        await setSelections({});
                        setItemModal(false);
                    }}>
                    <Text style={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    fontSize: 15, padding: 5}}><MaterialCommunityIcons name="close" size={25}/></Text>
                </TouchableOpacity>
        </Modal>
        </View>    )

}


const styles = StyleSheet.create({

    container: {
    backgroundColor: "white",
    borderRadius: 25,
    flexDirection: "row",
    width: '100%',
    padding: 10,
    marginVertical: 10,
    alignSelf: 'center',
    zIndex: 2,
    borderWidth: 0.5,
    borderColor: 'lightgray',
    shadowOffset: {width: 1, height: 1}, 
    shadowRadius: 3, 
    shadowOpacity: 0.2,
  },

  restaurantContainer: {
    height: "100%",
    width: "100%",
    padding: 20
  },

  drawer:{
    zIndex: 10,
    height: 500
  },

  icon: {
    padding: 0,
    margin: 0,
    alignSelf: 'center',
    paddingRight: 5
  },

  markerStyle: {
    
    height: 50,
    width: 30
    
  },


  allCafes: {
        fontWeight: 'bold',
        fontSize: 20,
        marginHorizontal: 15,
        marginBottom: 5
        
    },

    restaurantTitle: {
        fontSize: 15,
        margin: 15, 
        marginBottom: 5,
        fontWeight: 'bold'
    }, 

    distanceStyle: {
        fontSize: 13,
        margin: 15, 
        marginBottom: 5,
        color: 'gray',
        right: '6%',
        position: 'absolute'

    }, 

    restaurantCard: {
        width: "95%",
        backgroundColor: 'white',
        overflow: 'hidden',
        flexWrap: 'nowrap',
        margin: 5,
        alignSelf: 'center',
        borderRadius: 10,
        shadowColor: 'gray', 
        shadowOffset: {width: 2, height: 2}, 
        shadowRadius: 5, 
        shadowOpacity: 1,
    },

    restaurantList: {
        overflow: 'scroll',
        width: "100%"
    },

    restaurantImage: {
        height: 80,
        width: '46%',
        marginHorizontal: "2%",
        borderRadius: 8
    },

    restaurantDescription: {
        overflow: 'hidden',
        flexWrap: 'nowrap',
        margin: 15,
        marginTop: 0,
        fontSize: 12
        
    },

    imageRow: {
        flexDirection: 'row',
        margin: 10,
        marginTop: 0,
        marginBottom: 15
    },

    modalView: {
        width: "100%",
        backgroundColor: 'white',
        marginTop: 50,
        height: Dimensions.get("screen").width
    },

    lastCard:{
        height: 120
    },
    
    container2: {
    backgroundColor: "brown",
    alignItems: 'center',
    justifyContent: 'center',
    height: "100%"
    
    },
    map: {
    width: Dimensions.get('window').width,
    height: "100%",
    zIndex: 200
    
  },

  

})