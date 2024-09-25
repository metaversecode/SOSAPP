How the SOS Emitter (Client-side App) Works:

>> It utilizes Bluetooth Low Energy (BLE) technology.
>> The range can extend up to 150 meters.
>> No pairing required—the app broadcasts an SOS signal with the user's name, phone number, and location coordinates (encoded in Base64) to nearby devices, by modifying        data in the BLE characteristic UUID. 
                  
>> To trigger the SOS, the user simply long presses the red button. The signal starts emitting, and pressing the button again cancels it.


How the SOS Acceptor App Works:

>> The acceptor app makes the device advertise itself as a BLE device to receive the signal without needing to pair.
>> Once the signal is received, it decodes the data from Base64 and automatically opens Google Maps with the user’s location.
>> There's no need for manual navigation—it starts navigation directly. The responder also gets the user's name and phone number for quick communication.

So this app is still in development process your CONTRIBUTIONS will be appreciated.
Thanks,
Suraj
