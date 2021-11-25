

import React, { useEffect, useContext, useState } from 'react';
import {Linking, Image, TouchableOpacity, ScrollView, SlideModal, Button, Modal, TextInput, View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native'
import {MaterialCommunityIcons} from '@expo/vector-icons';
//import BottomSheet from 'reanimated-bottom-sheet'
import {getDistance, getPreciseDistance} from 'geolib';
import AuthContext from '../context/Context'
import {Firebase, db} from '../config/firebase';
import Cart from '../components/Cart'
//import CachedImage from 'react-native-expo-cached-image'

const auth = Firebase.auth();

function Search({navigation}){
  const authContext = useContext(AuthContext);
  const [restaurantList, setRestaurantList] = useState(Object.values(authContext.restaurants))
  const [itemsArr, setItemsArr] = useState({})
  const [modals, setModals] = useState({})
  const [picture1Loading, setPicture1Loading] = useState(new Array(Object.values(authContext.restaurants)).fill(false));
  const [picture2Loading, setPicture2Loading] = useState(new Array(Object.values(authContext.restaurants)).fill(false));
  


  useEffect(()=>{
  }, [])

 const calculatePreciseDistance = (start, end) => {
    var pdis = getPreciseDistance(
      start, end
    );
    return pdis;
  };

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

  const getItems=async(ele)=>{
    const items = await Firebase.firestore().collection('restaurants').doc(`${String(ele["name"])}-${String(ele["street"][0])}-${String(ele["city"])}`).collection("items").get()
    var tempItems = {}
    var modals = {}
    items.docs.map((item,i)=>{
      tempItems[item.data().name] = item.data();
      modals[item.data().name] = false;
    })

    const times = await Firebase.firestore().collection('restaurants').doc(`${String(ele["name"])}-${String(ele["street"][0])}-${String(ele["city"])}`).collection("operating hours").get()
    var tempTimes = {};
    times.docs.map((day, i)=>{
      tempTimes[day.id]=day.data();
    })
    return {tempItems, modals, tempTimes};

  }

  const getRestaurants = async () =>{ 
        const userDataTemp = await getUser();
        const collect = await Firebase.firestore().collection('restaurants').get();
        var tempList = {}
        const savedRestaurantsTemp = [];
        const savedRestaurantsObjectTemp = {};
        await collect.docs.map((doc, i)=>{
            tempList[i] = doc.data();   

        })
        setRestaurants(tempList); 
        

        

  } 

  const renderedRestaurants = async () => {

  }

  function RenderContent(){
    var numCafesNear = 0;
    var numSearch = 0;

    return(
    <View style={{width: "100%", height: Dimensions.get("screen").height, marginTop: 'auto', backgroundColor: 'white', shadowRadius: 10}}>

      <View>

        <View style={styles.container}>
          <MaterialCommunityIcons size={20} color={"gray"} style={styles.icon} name="magnify"/>

          <TouchableOpacity style={{marginTop: 5}} onPress={()=>{authContext.setSearch('')}}>
          {authContext.search.length === 0 ? null : <MaterialCommunityIcons name="close" />}
          </TouchableOpacity>

          <TextInput
            autoCapitalize="none" 
            autoCorrect={false}
            style={styles.textInput} 
            placeholder="Search"
            placeholderTextColor="#565757"
            defaultValue={authContext.search}
            onSubmitEditing={({nativeEvent: {text, eventCount, target}})=>{authContext.setSearch(text)}}
            style={{borderRadius: 2, paddingHorizontal: 5, paddingVertical: 3, width: '100%'}}
            >
        </TextInput>

         
        
        </View> 

        <View>
          {authContext.search.length === 0 ?  <Text style={styles.allCafes}>
          Cafes Near Me</Text> : <Text style={styles.allCafes}>
          Search</Text>} 
        </View>
        </View>
      <ScrollView showsVerticalScrollIndicator={false} styles={styles.modalView}>


        {Object.values(authContext.restaurants).map((ele, i)=>{
          if (authContext.search.length === 0){
            if (ele.city === authContext.userCity && ele.country === authContext.userCountry){
              numCafesNear += 1;
              return(
                    <View key={i} style={{borderRadius: 10, shadowColor: 'gray', shadowOffset: {width: 3, height: 3}, shadowRadius: 5, shadowOpacity: 0.6,}}>
                    <TouchableOpacity key={i} title="restaurant" underlayColor="#f4f3f3" 
                onPress={async () => {
                  //const arr = getItems(ele[0]);
                  //console.log(ele)
                getItems(ele).then((items) => navigation.navigate(String(ele["name"]), {restaurant: ele, itemsArr: items.tempItems, modals: items.modals, times: items.tempTimes}));
              
                  
                }}style={styles.restaurantCard}>
                  {/* FIX THE LOCATION COORDS LINE 136!!!! GETTING COMPONENT EXCEPTION, UNDEFIEND IS NOT AN OBJECT ON FIRST RENDER */}
                  {/* latitude: Number(authContext.location["coords"]["latitude"]) */}
                  {/* longitude: Number(authContext.location["coords"]["longitude"])} */}
                    <View style={{}}>
                    <View style={{flexDirection: 'row'}}>
                    <Text style={styles.restaurantTitle}>{ele["name"]}</Text>
                    {authContext.locationSet ? 
                    <Text style={styles.distanceStyle}>{(calculatePreciseDistance({latitude: Number(authContext.location.coords.latitude), longitude: Number(authContext.location.coords.longitude)}, {latitude: Number(ele["latitude"]), longitude: Number(ele["longitude"])})/1000*12).toFixed(0)} min walk</Text>
                    : <Text style={styles.distanceStyle}> </Text>}

                    {authContext.locationSet ? 
                    <MaterialCommunityIcons size={16} color={"gray"} style={{position: 'absolute', right: '1%', margin: 15, marginBottom: 5}} name="walk" />
                    : null}
                    </View>
                    <Text numberOfLines={1} style={styles.restaurantDescription}>{ele["description"]}</Text>
                    <View style={styles.imageRow}>
                    <Image style = {styles.restaurantImage} source={{uri: ele["pictures"][0]}}/>

                    <Image style = {styles.restaurantImage} source={{uri: ele["pictures"][1]}}/>
                    </View>
                    </View>
                    </TouchableOpacity>
                    </View> )
            }

          } else{
            if (ele.name.toUpperCase().includes(authContext.search.toUpperCase())){
              numSearch += 1;
                return(
                  <View key={i} style={{borderRadius: 10, shadowColor: 'gray', shadowOffset: {width: 3, height: 3}, shadowRadius: 5, shadowOpacity: 0.6,}}>
                  <TouchableOpacity key={i} title="restaurant" underlayColor="#f4f3f3" 
              onPress={async () => {
                //const arr = getItems(ele[0]);
                //console.log(ele)
              getItems(ele).then((items) => navigation.navigate(String(ele["name"]), {restaurant: ele, itemsArr: items.tempItems, modals: items.modals, times: items.tempTimes}));
            
                
              }}style={styles.restaurantCard}>
                {/* FIX THE LOCATION COORDS LINE 136!!!! GETTING COMPONENT EXCEPTION, UNDEFIEND IS NOT AN OBJECT ON FIRST RENDER */}
                {/* latitude: Number(authContext.location["coords"]["latitude"]) */}
                {/* longitude: Number(authContext.location["coords"]["longitude"])} */}
                  <View style={{}}>
                  <View style={{flexDirection: 'row'}}>
                  <Text style={styles.restaurantTitle}>{ele["name"]}</Text>
                  {authContext.locationSet ? 
                  <Text style={styles.distanceStyle}>{(calculatePreciseDistance({latitude: Number(authContext.location.coords.latitude), longitude: Number(authContext.location.coords.longitude)}, {latitude: Number(ele["latitude"]), longitude: Number(ele["longitude"])})/1000*12).toFixed(0)} min walk</Text>
                  : <Text style={styles.distanceStyle}> </Text>}

                  {authContext.locationSet ? 
                  <MaterialCommunityIcons size={16} color={"gray"} style={{position: 'absolute', right: '1%', margin: 15, marginBottom: 5}} name="walk" />
                  : null}
                  </View>
                  <Text numberOfLines={1} style={styles.restaurantDescription}>{ele["description"]}</Text>
                  <View style={styles.imageRow}>
                  <Image style = {styles.restaurantImage} source={{uri: ele["pictures"][0]}}/>

                  <Image style = {styles.restaurantImage} source={{uri: ele["pictures"][1]}}/>
                  </View>
                  </View>
                  </TouchableOpacity>
                  </View> )
              }

             }
          })}

          {/* {authContext.setLoadingRestaurants === true ? <ActivityIndicator size='large' style={{marginTop: 100, alignSelf: 'center'}}/> : null} */}

          {authContext.locationSet === false && authContext.search.length === 0? 
          <View>
          <MaterialCommunityIcons name="map-marker" size={120} color='lightgray' style={{alignSelf: 'center', marginTop: 100, opacity: 0.5}}/>

          <Text style={{width: '70%', alignSelf: 'center', opacity: 0.6, textAlign: 'center', marginTop: 25, color: 'gray', fontSize: 14, fontWeight: '500'}}>This app requires location settings to search for nearby cafes. Please turn on location services to see cafes near you.</Text> 
            <TouchableOpacity style={{marginTop: 20, alignSelf: 'center', padding: 10, paddingHorizontal: 20, backgroundColor: '#119aa3', borderRadius: 10, shadowColor: 'black', 
              shadowOffset: {width: 1, height: 1}, 
              shadowRadius: 2, 
              shadowOpacity: 0.6}} onPress={()=>Linking.openURL('app-settings:')}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>
                  Settings
              </Text>
          </TouchableOpacity>

          </View>
          : null}
          {authContext.locationSet === true && authContext.search.length !== 0 && numSearch === 0 ? <Text style={{width: '70%', alignSelf: 'center', opacity: 0.6, textAlign: 'center', marginTop: 100, color: 'gray', fontSize: 15, fontWeight: '500'}}>We're sorry, there are currently no cafes that match your search.</Text> : null}
          {authContext.locationSet === true && authContext.search.length === 0 && numCafesNear === 0 ? <View>
          <Text style={{width: '70%', alignSelf: 'center', textAlign: 'center', marginTop: 80, color: 'gray', opacity: 0.6, fontSize: 15, fontWeight: '500'}}>We're sorry, there are no cafes in your area. We are rapidly expanding our cafe selection so please check back later!</Text> 
          <Image style = {{width: '50%', resizeMode: 'contain', height: 200, alignSelf: 'center', marginTop: 40, opacity: 0.2}} source={require('../assets/sadCoffeeEdited.png')} />
          </View>: null}
            
      
       <View style={styles.lastCard}></View>

        
      </ScrollView>

    </View>)
}
  return (
    <View>

        <RenderContent/>   

    </View>
    
  )
}

const styles = StyleSheet.create({

    container: {
    backgroundColor: "white",
    borderRadius: 25,
    flexDirection: "row",
    width: '95%',
    padding: 10,
    marginVertical: 10,
    alignSelf: 'center',
    marginTop: 50,
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
        marginBottom: 15,
        marginVertical: 15
        
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
        height: 165,
        marginBottom: 10
    },

    restaurantList: {
        overflow: 'scroll',
        width: "100%"
    },

    restaurantImage: {
        height: 80,
        width: '46%',
        marginHorizontal: "2%",
        borderRadius: 8,
        marginTop: 1
        //resizeMode: 'cover'
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
export default Search