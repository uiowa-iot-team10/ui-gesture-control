const express                = require('express');
const app                    = express();
const http_client            = require('http').createServer(app);
const sio                    = require('socket.io');
const io_client              = sio(http_client);
const { createBluetooth }    = require('node-ble');
const { bluetooth, destroy } = createBluetooth();
var rdb                      = require( './rdb' );
var util                     = require('util');

// const EventEmitter = require('events');
// EventEmitter.defaultMaxListeners = 20;
// const events = new EventEmitter();
// events.setMaxListeners(20);

var CLIENT_PORT = process.env.PORT || 80;

var isConnected = false;

var GESTURES    = {
    0: "UP",
    1: "DOWN",
    2: "LEFT",
    3: "RIGHT",
    4: "INPUT"
};

//07:EF:6F:A9:54:00
var ARDUINO_BLUETOOTH_ADDR         = '';
const GYROX_CHARACTERISTIC_UUID    = '19B10011-E8F2-537E-4F6C-D104768A1214';
const DATA_SERVICE_UUID            = '19B10010-E8F2-537E-4F6C-D104768A1214';
const MOVEMENT_CHARACTERISTIC_UUID = '19B10012-E8F2-537E-4F6C-D104768A1214';

var device_list = [];
var MAC_LIST = [];

// To make other files accessible
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/bluetooth', (req, res) => {
    res.sendFile(__dirname + '/public/bluetooth.html');
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
            'player1': data.username,
            'player2': null,
            'create_time': data.time,
            'game': data.game,
            'active_players': 1,
            'moves': [],
            'current_moves': {
                'player1': null,
                'player2': null
            },
            'winner': null
        };
        rdb.database.ref(util.format("rooms/%s", config.rid)).set(config);
    });

    socket.on('disconnect', (data) => {
        console.log("User has disconnected.");
    });
    socket.on('BLE',function(data)
    {
        if(!isConnected)
        {
            findDevices();
        }
        setTimeout(() => {if(isConnected){socket.emit('GestureSense',"Arduino BLE Paired Successfully.  You may return to main page.");}},5000);});
});

http_client.listen(CLIENT_PORT, function(){
	console.log('[LOG] Listening for client side on *:' + CLIENT_PORT);
});

async function findDevices()
{
    const adapter = await bluetooth.defaultAdapter();
    await adapter.startDiscovery();
    const list_devices = await adapter.devices();
    const my_devices = await Promise.all(list_devices);
    console.log(my_devices);
    for (let d of my_devices)
    {
        const x = await adapter.getDevice(d);
        const name = await x.getName().then(function(result)
        {
            device_list.push(result); 
            MAC_LIST.push(d); 

        }).catch((err)=>{});
    }
    for(var i = 0; i < device_list.length; i++ )
    {
        if(device_list[i] == "GestureSense")
        {
            ARDUINO_BLUETOOTH_ADDR = MAC_LIST[i];
            console.log(ARDUINO_BLUETOOTH_ADDR)
            await adapter.stopDiscovery();
            break;
        }
    }
    setBLE(ARDUINO_BLUETOOTH_ADDR).then((ret) => {
        if(ret) console.log(ret);
    }).catch((err) => {
        console.log ( );
    });

}

// function now automatically connects to BLE Device(Arduino 33 BLE Sense) via bluetooth.
async function setBLE(address) {
    // Reference the BLE adapter and begin device discovery...s
    const adapter = await bluetooth.defaultAdapter();
    console.log( '[LOG] discovering...' );
    await adapter.startDiscovery();
    const device = await adapter.waitDevice(address);
    console.log( '[LOG] found device. attempting connection...');
    await device.connect();
    await adapter.stopDiscovery();
    console.log( '[LOG] connected to device!' );
    isConnected = true;

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