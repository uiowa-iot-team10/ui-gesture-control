const app = require('express')();
const http_script = require('http').Server(app);
const http_client = require('http').Server(app);
const io_script = require('socket.io')(http_script);
const io_client = require('socket.io')(http_client);
const SCRIPT_PORT = process.env.PORT || 9999;
const CLIENT_PORT = process.env.PORT || 80;
var script_connected = false;

var EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 20;
var events = new EventEmitter();
events.setMaxListeners(20);

// To make other files accessible
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// If path doesn't exists give a message
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist.");
});

// Socket stuff
io_client.on('connection', (socket) => {
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

io_script.on('connection', (socket) => {
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

http_script.listen(SCRIPT_PORT, () => {
	console.log('listening for python script on *:' + SCRIPT_PORT);
});

http_client.listen(CLIENT_PORT, () => {
	console.log('listening for client side on *:' + CLIENT_PORT);
});
