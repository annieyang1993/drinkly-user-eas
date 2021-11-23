import React, { useContext, useState, useMemo, useEffect} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Dimensions, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import {Firebase, db} from '../config/firebase';



global.addEventListener = () => {};
global.removeEventListener = () => {};



const auth = Firebase.auth();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
    }
  };

export default function AccountPage({navigation}){
  const [logoutModal, setLogoutModal] = useState(false);

    return(

      <View style={{height: Dimensions.get("screen").height, width: '100%', marginTop: 'auto', backgroundColor: 'white'}}>
            <View style={styles.container}>
            <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: 30, marginHorizontal: 10, marginTop: 0}}>Account</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: 'white', height: '100%', width: '95%', alignSelf: 'center'}}>

              <View style={{height: 100, borderBottomWidth: 1, borderBottomColor: 'lightgray', marginBottom: 50}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 40}} onPress={()=>navigation.navigate("Drinkly Cash")}>
                  <View>
                    <Text style={{fontWeight: 'bold', fontSize: 15}}>Drinkly Cash</Text>
                    <Text style={{fontSize: 12, color: 'gray'}}>Get $0 service fees with Drinkly Cash</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                </TouchableOpacity>
              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}} onPress={()=>{navigation.navigate("Personal Information")}}>
                  <View>
                    <Text style={{fontWeight: '500'}}>Personal Information</Text>
                    <Text style={{fontSize: 11, color: 'gray'}}>Edit your account information</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                </TouchableOpacity>
              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}} onPress={()=>{navigation.navigate("Payment Methods")}}>
                  <View>
                  <Text style={{fontWeight: '500'}}>Payment</Text>
                  <Text style={{fontSize: 11, color: 'gray'}}>Edit your payment methods and manage Drinkly Cash</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                </TouchableOpacity>

              </View>

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}} onPress={()=>{navigation.navigate("Location")}}>
                  <View>
                  <Text style={{fontWeight: '500'}}>Location</Text>
                  <Text style={{fontSize: 11, color: 'gray'}}>Update your location settings</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                 </TouchableOpacity>
              </View>

              {/* <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 20}}>
                  <View>
                  <Text style={{fontWeight: '500'}}>Notifications</Text>
                  <Text style={{fontSize: 11, color: 'gray'}}>Update your notification settings</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/>
                 </TouchableOpacity>
              </View> */}

              <View style={{height: 70, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginTop: 25}} onPress={()=>{setLogoutModal(true)}}>
                  <Text style={{fontWeight: '500'}}>Logout</Text>
                  {/* <MaterialCommunityIcons name="chevron-right" size={18} style={{position: 'absolute', right: 0}}/> */}
                 </TouchableOpacity>
              </View>

            
            </ScrollView>

            <Modal visible={logoutModal} transparent={true} animationType='slide'>
                <View style={{padding: 20, width: '95%', backgroundColor: 'white', position: 'absolute', bottom: '50%', height: 150, alignSelf: 'center', borderRadius: 15, shadowColor: 'gray', shadowOffset: {width: 2, height: 2}, shadowRadius: 5, shadowOpacity: 0.4}}>
                        <Text style={{textAlign: 'center', marginTop: 20}}>Are you sure you'd like to log out?</Text>
                      <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 10}}>
                        <TouchableOpacity 
                        
                        onPress={()=>{
                          handleSignOut()
                          
                          }}><View style={{marginHorizontal: 10, padding: 5, backgroundColor: '#119aa3', borderRadius: 5, paddingHorizontal: 10}}><Text style={{color: 'white', fontWeight: 'bold'}}>Yes</Text></View></TouchableOpacity>
                        <TouchableOpacity onPress={()=>{setLogoutModal(false)}}><View style={{marginHorizontal: 10, padding: 5, backgroundColor: '#119aa3', borderRadius: 5, paddingHorizontal: 10}}><Text style={{color: 'white', fontWeight: 'bold'}}>No</Text></View></TouchableOpacity>
                        </View>
               

                <TouchableOpacity
                style={{backgroundColor: 'white',
                borderRadius: 10,
                width: 20,
                height: 20,
                position: 'absolute',
                marginTop: 15,
                marginHorizontal: 20,
                color: 'gray',
                zIndex: 50,
                }}
                onPress={() => {
                    setLogoutModal(false)
                    //navigation.navigate(authContext.prevScreen, authContext.prevScreenParams)
                }}>
                <MaterialCommunityIcons name="close" size={22}/>
            </TouchableOpacity> 

                </View>


            
                    

            </Modal>

            </View>
        </View> 
        
    )

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
