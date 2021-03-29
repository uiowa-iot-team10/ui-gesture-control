const app                 = require('express')();
const http_client           = require('http').createServer(app);
const sio                   = require('socket.io');
const io_client             = sio(http_client);
const { createBluetooth } = require( 'node-ble' );

const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 20;
const events = new EventEmitter();
events.setMaxListeners(20);


var CLIENT_PORT = process.env.PORT || 80;
var GESTURES    = {
    0: "UP",
    1: "DOWN",
    2: "LEFT",
    3: "RIGHT",
    4: "INPUT"
};

let list_of_devices                = 0;
var ARDUINO_BLUETOOTH_ADDR         = '';
const DATA_SERVICE_UUID            = '19B10010-E8F2-537E-4F6C-D104768A1214';
const PROXIMITY_CHARACTERISTIC_UUID    = '19B10011-E8F2-537E-4F6C-D104768A1214';
const MOVEMENT_CHARACTERISTIC_UUID = '19B10012-E8F2-537E-4F6C-D104768A1214';


// To make other files accessible

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// If path doesn't exists give a message
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist.");
});

app.get('/test', function(req, res) {
	res.sendFile(__dirname + '/test/index.html');
});


//function now automatically connects to BLE Device(Arduino 33 BLE Sense) via bluetooth.
async function setBLE() {
     // Reference the BLE adapter and begin device discovery...
     const { bluetooth, destroy } = createBluetooth();
     const adapter = await bluetooth.defaultAdapter();
     await adapter.startDiscovery();
     const list_devices = await adapter.devices().then(function(result){
             list_of_devices = result;
     });
     for(const user_mac of list_of_devices)
     {
         const x = (await adapter.getDevice(user_mac)).getName().then(function(result){
             console.log("[DEVICE] " + result);
             if(result == "GestureSense")
             {
                ARDUINO_BLUETOOTH_ADDR = user_mac;
                 adapter.stopDiscovery();
             }
         }).catch(function(err)
         {
             //console.log(err);
         });

     }

     console.log( '[LOG] discovering...' );
     const device = await adapter.getDevice(ARDUINO_BLUETOOTH_ADDR);

     console.log( '[LOG] found device. attempting connection...');
     await device.connect();
     console.log( '[LOG] connected to device!' );

     // Get references to the desired UART service and its characteristics
     const gattServer = await device.gatt();
     const dataService = await gattServer.getPrimaryService( DATA_SERVICE_UUID.toLowerCase() );
     const proxChar = await dataService.getCharacteristic( PROXIMITY_CHARACTERISTIC_UUID.toLowerCase() );
     const movementChar = await dataService.getCharacteristic( MOVEMENT_CHARACTERISTIC_UUID.toLowerCase() );
     // Register for notifications on the RX characteristic
     await movementChar.startNotifications( );
     await proxChar.startNotifications( );



     // Callback for when data is received on RX characteristic
     movementChar.on( 'valuechanged', buffer =>
     {
         console.log('[LOG] Data is received from Arduino: ' + GESTURES[buffer[0]]);
         events.emit("gesture", GESTURES[buffer[0]]);
     });
     proxChar.on( 'valuechanged', buffer =>{
         if(buffer[0] == 0)
         {
            console.log('[LOG] Proximity data is received from Arduino: ' + buffer[0]);
            events.emit("gesture",buffer[0]);
         }
     });

 }

setBLE().then((ret) =>
{
    if (ret) console.log( ret );
}).catch((err) =>
{
    if (err) console.error(  );
});


// Socket stuff
io_client.on('connection', function(socket){
    console.log("[LOG] A user is connected to server.");
    socket.emit('connection', "Connected!");

    events.on("gesture", function(data) {
        console.log("[LOG] Sending gesture to client.");
        socket.emit("gesture", data);
    });
});

http_client.listen(CLIENT_PORT, function(){
	console.log('[LOG] Listening for client side on *:' + CLIENT_PORT);
});

