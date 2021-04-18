const express             = require('express');
const app                 = express();
const http_client         = require('http').createServer(app);
const sio                 = require('socket.io');
const io_client           = sio(http_client);
const { createBluetooth } = require( 'node-ble' );
var rdb                   = require( './rdb' );
var util                  = require('util');

// const EventEmitter = require('events');
// EventEmitter.defaultMaxListeners = 20;
// const events = new EventEmitter();
// events.setMaxListeners(20);

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
const GYROX_CHARACTERISTIC_UUID    = '19B10011-E8F2-537E-4F6C-D104768A1214';
const DATA_SERVICE_UUID            = '19B10010-E8F2-537E-4F6C-D104768A1214';
const MOVEMENT_CHARACTERISTIC_UUID = '19B10012-E8F2-537E-4F6C-D104768A1214';

// To make other files accessible
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/forgot', (req, res) => {
    res.sendFile(__dirname + '/public/forgot.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
});

app.get('/tic-tac-toe', (req, res) => {
    res.sendFile(__dirname + '/public/games/ticTacToe.html');
});

app.get('/connect4', (req, res) => {
    res.sendFile(__dirname + '/public/games/connect4.html');
});

// If path doesn't exists give a message
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist.");
});

app.get('/test', function(req, res) {
	res.sendFile(__dirname + '/public/test/index.html');
});

// Socket stuff
io_client.on('connection', function(socket){
    console.log("[LOG] A user is connected to server.");
    socket.emit('connection', "Connected!");

    socket.on('get_active_rooms', (data) => {
        rdb.database.ref("rooms").get().then((snapshot) => {
            if (snapshot) {
                // console.log(snapshot.val());
                socket.emit("active_rooms", snapshot.val());
            }
            else socket.emit("active_rooms", null);
        });
    });

    socket.on('delete_room', (data) => {
        rdb.database.ref(util.format("rooms/%s", data.rid)).get().then((snapshot) => {
            if (snapshot) {
                rdb.database.ref(util.format("history/rooms/%s", data.rid)).set(snapshot);
                rdb.database.ref(util.format("rooms/%s", data.rid)).remove();
            }
        });
    });

    socket.on('create_room', (data) => {
        var username = data.username;
        username = username.replace(/[.#$\[\]]/g,'-');
        var config = {
            'rid': util.format('%s-%s', username, data.time),
            'rname': data.rname,
            'host': data.displayName,
            'host_email': data.username,
            'create_time': data.time,
            'game': data.game,
            'active_players': 1,
            'moves': [],
            'current_moves': {
                [data.username]: null
            },
            'winner': null
        };
        rdb.database.ref(util.format("rooms/%s", config.rid)).set(config);
    });

    socket.on('disconnect', (data) => {
        console.log("User has disconnected.");
    })
});

http_client.listen(CLIENT_PORT, function(){
	console.log('[LOG] Listening for client side on *:' + CLIENT_PORT);
});

// function now automatically connects to BLE Device(Arduino 33 BLE Sense) via bluetooth.
async function setBLE() {
    // Reference the BLE adapter and begin device discovery...
    const { bluetooth, destroy } = createBluetooth();
    const adapter = await bluetooth.defaultAdapter();
    console.log( '[LOG] discovering...' );
    await adapter.startDiscovery();
    while (true) {
        const list_devices = await adapter.devices().then(function(result){
                list_of_devices = result;
        });
        //console.log(list_of_devices);
        let BLE_DEVICES = [];
        for await (let user_mac of list_of_devices)
        {
            const x = (await adapter.getDevice(user_mac)).getName().then(function(result){
                console.log("[DEVICE] " + result);
                BLE_DEVICES.push(result);
                if(result == "GestureSense")
                {
                    ARDUINO_BLUETOOTH_ADDR = user_mac;
                }
            }).catch(function(err)
            {
                // console.log(err);
            });
        }

        // IF ARDUINO "GestureSense" is not found then run again and again until it is found.
        if(BLE_DEVICES.includes("GestureSense"))
            break;
    }
    adapter.stopDiscovery();

    const device = await adapter.getDevice(ARDUINO_BLUETOOTH_ADDR);

    console.log( '[LOG] found device. attempting connection...');
    await device.connect();
    console.log( '[LOG] connected to device!' );

    // Get references to the desired UART service and its characteristics
    const gattServer = await device.gatt();
    const dataService = await gattServer.getPrimaryService( DATA_SERVICE_UUID.toLowerCase() );
    const movementChar = await dataService.getCharacteristic( MOVEMENT_CHARACTERISTIC_UUID.toLowerCase() );
    // Register for notifications on the RX characteristic
    await movementChar.startNotifications( );

    // Callback for when data is received on RX characteristic
    movementChar.on( 'valuechanged', buffer =>
    {
        console.log('[LOG] Data is received from Arduino: ' + GESTURES[buffer[0]]);
        io_client.sockets.emit("gesture",GESTURES[buffer[0]]);
    });
 }

setBLE().then((ret) =>
{
    if (ret) console.log( ret );
}).catch((err) =>
{
    if (err) console.error(  );
});
