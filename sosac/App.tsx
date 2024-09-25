import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Linking, TouchableWithoutFeedback, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { BleManager } from 'react-native-ble-plx';
const base64 = require('base-64');

const SERVICE_UUID = 'a3c87600-0005-1000-8000-001a11000100';
const CHARACTERISTIC_UUID = 'a3c87601-0005-1000-8000-001a11000100'; // Ensure this is correct
const MANUFACTURER_ID = 0xFFFF; // Example Manufacturer ID

const bleManager = new BleManager();

const App = () => {
  const [name, setname] = useState([])
  const[ph, setph] = useState([])
  const[latitude, setl] = useState([])
  const[longitude, setlon] = useState([])


  const coordinates = {
    latitude: latitude, // Replace with your latitude
    longitude: longitude, // Replace with your longitude
  };

  const openGoogleMaps = (latitude, longitude) => {
    // Directly opens Google Maps to the specified coordinates
    const url =  `google.navigation:q=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => console.error("An error occurred", err));
  };
  // const readSOS = async () => {
  //   try {
  //     // Directly read the characteristic value
  //     await deviceConnection.discoverAllServicesAndCharacteristics();
  //     setConnectedDevice(deviceConnection);
  //     const characteristic = await bleManager.readCharacteristicForDevice(
  //       SERVICE_UUID,      // Known service UUID
  //       CHARACTERISTIC_UUID , // Known characteristic UUID
  //     );
  
  //     // Decode the base64 data from the characteristic
  //     const data = Buffer.from(characteristic.value, 'base64').toString(); 
  //     console.log('Received SOS data:', data);
  //   } catch (error) {
  //     console.error('Error reading SOS:', error);
  //   }
  // };
  
  
  // const startNotification = async (deviceConnection) => {
  //   console.log("ok")
  //   if (deviceConnection) {
  //     console.log("ok")

  //     deviceConnection.monitorCharacteristicForService(SERVICE_UUID, "a3c87603-0005-1000-8000-001a11000100", (error, characteristic) => {
  //       if (error) {
  //         console.error('Notification error:', error);
  //         return;
  //       }

  //       const data = Buffer.from(characteristic.value, 'base64').toString();
  //       console.log('Received SOS data via notification:', data);

  //     });
  //   }
  // };

  return (
    <View style={styles.container}>
      <View style = {styles.view3}>
        <View style = {styles.view4}>
        <Text style = {styles.first}>SOS Received from</Text>
        <Text style = {styles.second}>{name}</Text>
        <Text style = {styles.first}>Phone Number</Text>
        <Text style = {styles.second}>{ph}</Text>
        </View>

     <View style = {styles.view2}>
      <TouchableWithoutFeedback onPress={() => {openGoogleMaps(coordinates.latitude, coordinates.longitude)}}>
        <View style = {styles.view1}>
          <Text>Start Navigation</Text>
        </View>
      </TouchableWithoutFeedback>
      </View>
      </View>
        
      
    </View>
  );
};

const styles = StyleSheet.create({
  view4:{
    marginRight:"auto",
    marginLeft:"auto",
    marginTop:200
  },
  first:{
    fontSize:50,
    fontFamily: 'Roboto',
    color:"dodgerblue",
    textAlign:"center",
    marginTop:20

  },
  second :{
    fontSize:50,
    color:"black",
    textAlign:"center",
    marginTop:20
  },
  view2 :{
   marginRight:"auto",
   marginLeft:"auto",
  },
  
 
});

export default App;
