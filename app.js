const { createBluetooth } = require( 'node-ble' );
const express    = require('express');
const app        = express();
var EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 20;
var events = new EventEmitter();
events.setMaxListeners(20);

var SCRIPT_PORT  = 9999;
var CLIENT_PORT  = 80;

var GESTURES = {
    0: "UP",
    1: "DOWN",
    2: "LEFT",
    3: "RIGHT"
};

const ARDUINO_BLUETOOTH_ADDR       = '5A:6B:31:73:71:00';
const DATA_SERVICE_UUID            = '19B10010-E8F2-537E-4F6C-D104768A1214';
const GYROX_CHARACTERISTIC_UUID    = '19B10011-E8F2-537E-4F6C-D104768A1214';
const MOVEMENT_CHARACTERISTIC_UUID = '19B10012-E8F2-537E-4F6C-D104768A1214';

var http1 = require('http').createServer(app);
var http2 = require('http').createServer(app);
var sio   = require('socket.io');
var psio  = sio(http1);
var csio  = sio(http2);
var script_connected = false;

// To make other files accessible
app.use(express.static(__dirname));

// If path doesn't exists give a message
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist.");
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

async function setBLE() {
    // Reference the BLE adapter and begin device discovery...
    const { bluetooth, destroy } = createBluetooth();
    const adapter = await bluetooth.defaultAdapter();
    const discovery =  await adapter.startDiscovery();
    console.log( '[LOG] discovering...' );

    // Attempt to connect to the device with specified BT address
    const device = await adapter.waitDevice( ARDUINO_BLUETOOTH_ADDR.toUpperCase() );
    console.log( '[LOG] found device. attempting connection...' );
    await device.connect();
    console.log( '[LOG] connected to device!' );

    // Get references to the desired UART service and its characteristics
    const gattServer = await device.gatt();
    const dataService = await gattServer.getPrimaryService( DATA_SERVICE_UUID.toLowerCase() );
    const gyroXChar = await dataService.getCharacteristic( GYROX_CHARACTERISTIC_UUID.toLowerCase() );
    const movementChar = await dataService.getCharacteristic( MOVEMENT_CHARACTERISTIC_UUID.toLowerCase() );

    // Register for notifications on the RX characteristic
    await movementChar.startNotifications( );

    // Callback for when data is received on RX characteristic
    movementChar.on( 'valuechanged', buffer =>
    {
        console.log('Data is received from Arduino: ' + GESTURES[buffer[0]]);
        events.emit("gesture", GESTURES[buffer[0]]);
    });
}

setBLE().then((ret) =>
{
    if (ret) console.log( ret );
}).catch((err) =>
{
    if (err) console.error( err );
});

// Socket stuff
csio.on('connection', function(socket){
    console.log("A user is connected to server.");
    socket.emit("connection", "Connected!");
    socket.emit("script-status", script_connected);

    events.on("gesture", function(data){
        console.log("Sending gesture to client.");
        socket.emit("gesture", data);
    });

    events.on("script-status", function(data){
        socket.emit("script-status", data);
    });
});

psio.on('connection', function(socket){
    console.log("Python script is connected to server.");
    script_connected = true;
    events.emit("script-status", script_connected);

    socket.on("gesture", function(data){
        console.log("Received a gesture from script: " + data);
        events.emit("gesture", data);
    });

    socket.on("disconnect", function(data){
        script_connected = false;
        events.emit("script-status", script_connected);
    })
});

http1.listen(SCRIPT_PORT, function() {
	console.log('listening for python script on *:' + SCRIPT_PORT);
});

http2.listen(CLIENT_PORT, function() {
	console.log('listening for client side on *:' + CLIENT_PORT);
});
