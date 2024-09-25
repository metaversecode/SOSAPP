import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, TextInput, Text, ScrollView, KeyboardAvoidingView, Platform, PermissionsAndroid, Alert , StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer'; // Ensure you have 'buffer' package installed
const base64 = require('base-64');
import Geolocation from 'react-native-geolocation-service';
import BLEAdvertiser from 'react-native-ble-advertiser';


// UUIDs
const SERVICE_UUID = 'a3c87600-0005-1000-8000-001a11000100';
const CHARACTERISTIC_UUID = 'a3c87601-0005-1000-8000-001a11000100'; //IN future if i went into final round i will make these uuids get directly from devices i dont have time to do now exam is going on :). Its my Samsung TAb UUID
const MANUFACTURER_ID = 0xFFFF; // Example Manufacturer ID APPLE

const bleManager = new BleManager();


const App = () => {
  const [isAdvertising, setIsAdvertising] = useState(false);

  const [name, setName] = useState('');
  const [size, setsize] = useState(120);
  const [text, settxt] = useState("SOS");
  const [size1, setsize1] = useState(50);
  const [text1, settxt1] = useState("Long Press To Activate");
  const [color, setc] = useState("red");
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [sosSent, setSosSent] = useState(false);

  // Initialize WiFi P2P and request permissions on app launch
  useEffect(() => {
    
    checkLoginInfo();
  }, []);
  function longpress(){
    setsize(35)
    settxt("Sending in 5 Seconds")
    settxt1("Tap to Cancel")
    setTimeout(function(){
      scanAndSendSOS();
      setc("green");
      settxt("Broadcasting Started")
      settxt1("Don't Worry Someone is coming to help!")
    }, 5000)
  }
  function presss(){
    stopScan();
    setc("red")
    setsize(120)
    settxt("SOS")
    settxt1("Long Press To Activate")
  }
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        if (
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          startAdvertising();
          console.log('Permissions granted');
          

        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.error('Error requesting permissions:', err);
      }
    }
  };
  requestPermissions();
  const getSOSData = async () => {
  
    // Return a promise that resolves with SOS data (including location)
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Construct the SOS data with location
          const sosData = {
            sos: true,
            location: {
              latitude,
              longitude,
            },
          };
          const encodedData = Buffer.from(JSON.stringify(sosData)).toString('base64');
          // Resolve with the SOS data
          resolve(encodedData);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };
  const startAdvertising = () => {
    try {
      BLEAdvertiser.setCompanyId(MANUFACTURER_ID);
      BLEAdvertiser.broadcast(SERVICE_UUID, [0X42], {
        advertiseMode: BLEAdvertiser.ADVERTISE_MODE_LOW_LATENCY,
        txPowerLevel: BLEAdvertiser.ADVERTISE_TX_POWER_HIGH,
        connectable: true,
        includeDeviceName: true, // Should be false to avoid size limit errors
      })
        .then(() => {
          console.log('Advertising started');
          setIsAdvertising(true);
        })
        .catch((error) => {
          console.error('Advertising failed:', error);
        });
    } catch (error) {
      console.error('Error starting advertising:', error);
    }
  };

  const checkLoginInfo = async () => {
    try {
      const storedName = await AsyncStorage.getItem('name');
      const storedMobile = await AsyncStorage.getItem('mobile');
      const storedEmail = await AsyncStorage.getItem('email');

      if (storedName && storedMobile && storedEmail) {
        setName(storedName);
        setMobile(storedMobile);
        setEmail(storedEmail);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login info:', error);
    }
  };

  const saveLoginInfo = async () => {
    if (name && mobile && email) {
      try {
        await AsyncStorage.setItem('name', name);
        await AsyncStorage.setItem('mobile', mobile);
        await AsyncStorage.setItem('email', email);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error saving user info:', error);
      }
    } else {
      Alert.alert('Please fill all the details');
    }
  };

  const clearLoginInfo = async () => {
    try {
      await AsyncStorage.clear();
      setName('');
      setMobile('');
      setEmail('');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error clearing login info:', error);
    }
  };
  const scanAndSendSOS = () => {
    try{
    // if (isScanning) {
    //   console.log('Already scanning, stopping previous scan.');
    //   bleManager.stopDeviceScan();
    //   setIsScanning(false);
    //   return;
    // }
  
    setDevices([]); // Clear devices before scan
    setIsScanning(true);
    console.log('Starting scan...');
  
    // Start scanning for devices
    bleManager.startDeviceScan([], null, async (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        return;
      }
  
      // Once a device is found
      if (device && device.name) {  
        try {
          // Connect to the device
          const deviceConnection = await bleManager.connectToDevice(device.id);
          console.log('Connected to device:', device.name);
  
          // Discover services and characteristics
          await deviceConnection.discoverAllServicesAndCharacteristics();
          console.log('Discovered services and characteristics');
  
          // Find the service with the SERVICE_UUID
          const services = await deviceConnection.services();
          const service = services.find(s => s.uuid === SERVICE_UUID);
  
          if (service) {
            console.log('Service found:', service.uuid);
  
            // Get the characteristics for the service
            const characteristics = await deviceConnection.characteristicsForService(service.uuid);
            const characteristic = characteristics.find(c => c.uuid === CHARACTERISTIC_UUID);
  
            if (characteristic) {
              console.log('Characteristic found:', characteristic.uuid);
  
              // Prepare the SOS data (this sends "SOS" encoded in base64)
              const sosData = await getSOSData()

             
              // Send data using the characteristic
              await bleManager.writeCharacteristicWithoutResponseForDevice(
                deviceConnection.id, SERVICE_UUID, CHARACTERISTIC_UUID, sosData
              );
             
              console.log('SOS sent successfully!');
            } else {
              console.error('Characteristic not found');
            }
          } else {
            console.error('Service not found');
          }
        } catch (error) {
          console.error('Connection or data transfer error:', error);
        }
      }
    });
  
    // // Stop scanning after 10 seconds
    // setTimeout(() => {
    //   bleManager.stopDeviceScan();
    //   setIsScanning(false);
    //   console.log('Scan stopped.');
    // }, 10000); // Stops scan after 10 seconds
  }
  catch(err){}
  };
  const stopScan = () => {
    if (isScanning) {
      bleManager.stopDeviceScan();
      setIsScanning(false);
      console.log('Scan stopped.');
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {!isLoggedIn ? (
          <View>
            <View style={styles.v1}>
              <View style={styles.vt1}>
                <Text style={styles.t1}>Hii!</Text>
              </View>
              <View style={styles.vt2}>
                <Text style={styles.t2}>Enter your details to continue</Text>
              </View>
            </View>
            {/* Login */}
            <View style={styles.v2}>
              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={(text) => setName(text)}
                style={styles.inputt}
              />
              <TextInput
                placeholder="Mobile Number"
                value={mobile}
                keyboardType="phone-pad"
                onChangeText={(text) => setMobile(text)}
                style={styles.inputt}
              />
              <TextInput
                placeholder="Email"
                value={email}
                keyboardType="email-address"
                onChangeText={(text) => setEmail(text)}
                style={styles.inputt}
              />
              <TouchableWithoutFeedback onPress={saveLoginInfo}>
                <View style={styles.btn1}>
                  <Text style={{ color: "white", textAlign: "center" }}>Save Info</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        ) : (
          // SOS Screen
          <View style={styles.sos1}>
            <TouchableOpacity onLongPress={longpress} onPress={presss}>
              <View style={[styles.sos2, { backgroundColor: color }]}>
                <Text style={[styles.sost1, { fontSize: size }]}>{text}</Text>
                <Text style={[styles.sost2, { marginTop: size1 }]}>{text1}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearLoginInfo}>
              <View style={styles.btn2}>
                <Text style={styles.sost3}>Change Info</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



const styles = StyleSheet.create({
  btn2 :{
    backgroundColor:"black",
    padding:20,
    width:"70%",
    borderRadius:8,
    margin:"auto"

  },
  sost3:{
    color: "white",
    textAlign:"center"
  },
  sost2:{
    textAlign:"center",
    color:"white",
    fontSize:20,
    marginLeft:10
  },
  sost1: {
    textAlign:"center",
    color:"white",
    
    marginTop:80,
  },
  sos1 :{
    padding: 20,
  },
  sos2:{
    borderRadius:55,
    height : "75%",

  },
  btn1:{
    backgroundColor:"darkblue",
    padding:20,
    marginTop:40,
    width:"40%",
    borderRadius:88,
    marginLeft:200
  },
  inputt: {
    borderRadius: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: "white",
  },
  v2: {
    backgroundColor: "dodgerblue",
    marginTop: 70,
    position:"relative",
    top:30,
    width: "100%",
    padding: 50,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 50,
    height: "65%",
  },
  t1: {
    fontSize: 73,
    fontWeight: "500",
    color: "black",
    fontFamily: "sans-serif-condensed",
  },
  vt1: {
    marginLeft: 20,
    marginTop: 80,
  },
  vt2: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  t2: {
    fontSize: 33,
    fontWeight: "500",
    color: "black",
    fontFamily: "sans-serif-condensed",
  },
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default App;
