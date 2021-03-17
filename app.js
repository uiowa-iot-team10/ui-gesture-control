const express    = require('express');
const app        = express();
var EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 20;
var events = new EventEmitter();
events.setMaxListeners(20);

var SCRIPT_PORT  = 9999;
var CLIENT_PORT  = 80;

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
