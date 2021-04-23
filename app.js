const express                = require('express');
const app                    = express();
const http_client            = require('http').createServer(app);
const sio                    = require('socket.io');
const io_client              = sio(http_client);
const { createBluetooth }    = require('node-ble');
const { bluetooth, destroy } = createBluetooth();
var rdb                      = require( './rdb' );
var util                     = require('util');
const { createHash, }        = require('crypto');

var CLIENT_PORT = process.env.PORT || 80;

var isConnected = false;

var GESTURES    = {
    0: "UP",
    1: "DOWN",
    2: "LEFT",
    3: "RIGHT",
    4: "INPUT"
};

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

app.get('/waiting_room', (req, res) => {
    res.sendFile(__dirname + '/public/waiting_room.html');
});

app.get('/stats', (req, res) => {
    res.sendFile(__dirname + '/public/stats.html');
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

    socket.on("create_user_database", (data) => {
        rdb.database.ref(util.format("users/%s", data.email.replace(/[.#$\[\]]/g,'-'))).set(data);  
    });

    socket.on('get_active_rooms', (data) => {
        rdb.database.ref("rooms").get().then((snapshot) => {
            if (snapshot) {
                var rooms = {}
                for (var rid in snapshot.val()){
                    if (snapshot.val()[rid].active_players < 2) rooms[rid] = snapshot.val()[rid]
                }
                socket.emit("active_rooms", rooms);
            }
            else socket.emit("active_rooms", null);
        });
    });

    socket.on('delete_room', (data) => {
        rdb.database.ref(util.format("rooms/%s", data.rid)).get().then((snapshot) => {
           // if (snapshot) {
                rdb.database.ref(util.format("history/rooms/%s", data.rid)).set(snapshot.val());
                rdb.database.ref(util.format("rooms/%s", data.rid)).remove();
            //}
        });
    });

    socket.on('get_user_game_data',(data) =>
    {
        rdb.database.ref(util.format("users/%s", data.email.replace(/[.#$\[\]]/g,'-'))).get().then((snapshot) =>
        {
            var stats = {
                'total_games_played': snapshot.val().TotalGamesPlayed,
                'total_games_won': snapshot.val().TotalGamesWon,
                'total_games_lost': snapshot.val().TotalGamesLost,
                'connect4_wins': snapshot.val().Connect4Wins,
                'connect4_losses': snapshot.val().Connect4Losses,
                'tictactoe_wins': snapshot.val().TicTacToeWins,
                'tictactoe_losses': snapshot.val().TicTacToeLosses,
            };
            socket.emit('send_user_game_data',stats);
        });
    });

    socket.on("host_waiting", (data) => {
        rdb.database.ref(util.format("rooms/%s/active_players", data.rid)).on('value', async (current_active_players) => {
            if (current_active_players.val() == 2) {
                socket.emit("game_ready", {
                    'game': data.game
                });
                rdb.database.ref(util.format("rooms/%s/active_players", data.rid)).off('value');
            }
        });
    });

    socket.on('create_room', (data) => {
        var rid = createHash('sha3-256').update(util.format("%s-%s", data.username, data.time)).digest('hex');
        var config = {
            'rid': rid,
            'rname': data.rname,
            'host': data.displayName,
            'host_email': data.username,
            'player1': data.username,
            'player2': -1,
            'create_time': data.time,
            'game': data.game,
            'active_players': 1,
            'moves': -1,
            'playerTurn': 'player1',
            'current_moves': {
                'player1': -1,
                'player2': -1
            },
            'winner': -1
        };
        rdb.database.ref(util.format("rooms/%s", config.rid)).set(config);
        socket.emit("room_ready", {
            'rid': rid,
            'pid': "player1",
            'game': (data.game == "tic-tac-toe") ? "tic-tac-toe" : "connect4"
        });
    });

    socket.on("increment_active_players", (data) => {
        rdb.database.ref(util.format("rooms/%s/", data.rid)).get().then((snapshot) => {
            if (snapshot && snapshot.val().game == data.game) {
                var active_players = snapshot.val().active_players;
                if (active_players < 2) {
                    active_players++;
                    rdb.database.ref(util.format("rooms/%s/%s", data.rid, data.pid)).set(data.email);
                    rdb.database.ref(util.format("rooms/%s/active_players", data.rid)).set(active_players);
                    if (active_players == 2) {
                        const session_game = (data.game == "tic-tac-toe") ? "tic-tac-toe" : "connect4";
                        socket.emit("game_ready", {
                            'game': session_game
                        });
                    }
                }
            }
        });
    });

    socket.on('playerMove',(data)=>
    {
        if(data.player == 'player1')
        {
            rdb.database.ref(util.format("rooms/%s/playerTurn", data.rid)).set('player2');
        }
        if(data.player == 'player2')
        {
            rdb.database.ref(util.format("rooms/%s/playerTurn", data.rid)).set('player1');
        }
    });

    socket.on('moveCoord',(data) => {
        rdb.database.ref(util.format("rooms/%s/current_moves/%s", data.rid, data.player)).set([data.row, data.col]);
        // io_client.sockets.emit('move',data);
    });

    socket.on("getPlayerList",(data) =>
    {
        rdb.database.ref(util.format("rooms/%s/", data.rid)).get().then((snapshot) =>
        {
            var config = {
                'player1': snapshot.val().player1,
                'player2': snapshot.val().player2
            };
            if(data.game = 'connect4')
            {
                socket.emit('connect4_game',config);
            }
            //socket.emit('tictactoe_game',config);
        });
    });

    socket.on("player1_ready2play", (data) => {
        rdb.database.ref(util.format("rooms/%s/current_moves/player2", data.rid)).on('value', async (target_move) => {
            if (target_move.val()) {
                socket.emit("move", target_move.val());
            }
        });
        rdb.database.ref(util.format("rooms/%s/playerTurn", data.rid)).on('value', async (snapshot) => {
            socket.emit('playerTurnDone',{'player':snapshot.val()});
        });
    });

    socket.on("player2_ready2play", (data) => {
        rdb.database.ref(util.format("rooms/%s/current_moves/player1", data.rid)).on('value', async (target_move) => {
            if (target_move.val()) {
                socket.emit("move", target_move.val());
            }
        });
        rdb.database.ref(util.format("rooms/%s/playerTurn", data.rid)).on('value', async (snapshot) => {
            socket.emit('playerTurnDone',{'player':snapshot.val()});
        });
    });

    //Connect4Losses , Connect4Wins, TotalGamesLost , TotalGamesPlayed , TotalGamesWon 
    socket.on('playerWin',(data) => {
        rdb.database.ref(util.format("users/%s", data.winner.replace(/[.#$\[\]]/g,'-'))).get().then((snapshot) =>
        {
            rdb.database.ref(util.format("users/%s/Connect4Wins",data.winner.replace(/[.#$\[\]]/g,'-'))).set(snapshot.val().Connect4Wins + 1);
            rdb.database.ref(util.format("users/%s/TotalGamesPlayed",data.winner.replace(/[.#$\[\]]/g,'-'))).set(snapshot.val().TotalGamesPlayed + 1);
            rdb.database.ref(util.format("users/%s/TotalGamesWon",data.winner.replace(/[.#$\[\]]/g,'-'))).set(snapshot.val().TotalGamesWon + 1);
        });
        rdb.database.ref(util.format("users/%s", data.loser.replace(/[.#$\[\]]/g,'-'))).get().then((snapshot) =>
        {
            rdb.database.ref(util.format("users/%s/Connect4Losses",data.loser.replace(/[.#$\[\]]/g,'-'))).set(snapshot.val().Connect4Wins + 1);
            rdb.database.ref(util.format("users/%s/TotalGamesPlayed",data.loser.replace(/[.#$\[\]]/g,'-'))).set(snapshot.val().TotalGamesPlayed + 1);
            rdb.database.ref(util.format("users/%s/TotalGamesLost",data.loser.replace(/[.#$\[\]]/g,'-'))).set(snapshot.val().TotalGamesWon + 1);
        });
        rdb.database.ref(util.format('rooms/%s/winner', data.rid)).set(data.winner);
        io_client.sockets.emit("printWinner",data);
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