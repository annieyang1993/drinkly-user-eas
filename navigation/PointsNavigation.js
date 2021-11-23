import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ImageBackground, ScrollView, Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AuthContext from '../context/Context';
//import CachedImage from 'react-native-expo-cached-image'

export default function PointsNavigation({navigation}){
    const authContext = useContext(AuthContext);

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
            <View style={styles.container}>
            <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: 30, marginHorizontal: 10, marginTop: 80}}>Points</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: 'white', height: '100%'}}>
            {Object.keys(authContext.pointsList).length === 0 ? <Text style={{alignSelf: 'center', marginTop: 250}}>You have no points yet.</Text>:  null}
            {Object.values(authContext.pointsList).map((card, i)=>{
                return(<View key={i} style={{width: '98%', alignSelf: 'center', marginBottom: 30, height: 210, borderRadius: 20, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 1, elevation: 5, shadowOffset: { width: 0, height: 0 }}}>
                    <ImageBackground style={{width: '100%', opacity: 0.9, borderRadius: 20, height: 210}} imageStyle={{borderRadius: 10}} resizeMode= 'cover' source={{uri: card["restaurant_card_pic"]}}>
                        <Text numberOfLines={1} style={{marginTop: 15, alignSelf: 'center', fontWeight: 'bold', fontSize: 20, color: 'white', shadowColor: '#000', shadowOpacity: 1, elevation: 5, shadowOffset: { width: 0, height: 0 }}}>
                            {card["restaurant_name"]}</Text>
                        {card["rewards"] === 0 ? <View style={{height: 90}}></View> : 
                        <View style={{height: 85}}>
                            <MaterialCommunityIcons name="ticket" size={80} color={'#44bec6'} style={{alignSelf: 'center', shadowColor: '#000', marginTop: -5, shadowOpacity: 1, elevation: 5, shadowOffset: { width: 0, height: 0 }}}/>
                            <Text style={{color: 'white', alignSelf: 'center', fontWeight: 'bold', color: 'white', shadowColor: '#000', shadowOpacity: 1, marginTop: -5, elevation: 5, shadowOffset: { width: 0, height: 0 }}}>You have a reward!</Text>
                            <Text style={{color: 'white', alignSelf: 'center', width: '75%', flexWrap: 'wrap', alignSelf: 'center', textAlign: 'center', fontWeight: 'bold', color: 'white', shadowColor: '#000', fontSize: 9, shadowOpacity: 1, elevation: 5, shadowOffset: { width: 0, height: 0 }}}>Go to your homepage's "Discounts and rewards" to claim.</Text>
                        </View>}
                        <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 30, maxWidth: '90%', alignSelf: 'center', flexWrap: 'wrap'}}>
                            {(new Array(card["current_points"]).fill(true)).map((point, j)=>{
                                return(<MaterialCommunityIcons key={j} name="coffee" color={'#44bec6'} size={25} style={{opacity: 1, shadowColor: '#000', shadowOpacity: 1, elevation: 5, shadowOffset: { width: 0, height: 0 }}}/>)
                            })}

                            {(new Array(card["max_points"]-card["current_points"]).fill(true)).map((point, j)=>{
                                return(<MaterialCommunityIcons key={j} name="coffee" color={'lightgray'} size={25} style={{opacity: 1, shadowColor: '#000', shadowOpacity: 1, elevation: 5, shadowOffset: { width: 0, height: 0 }}}/>)
                            })}
                        </View>
                    </ImageBackground>
                </View>)
            })}
            <View style={{height: 200, width: '100%'}}>
            </View>
            </ScrollView>

            </View>

        </View>    )

}

const styles = StyleSheet.create({

    container: {
    borderRadius: 25,
    width: '95%',
    marginVertical: 10,
    alignSelf: 'center',
    marginTop: 50,
    zIndex: 2,
  }
})