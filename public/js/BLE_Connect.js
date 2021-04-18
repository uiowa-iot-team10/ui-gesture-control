var socket = io.connect();

function testFunction()
{
    console.log("pressed button");
    socket.emit('BLE',true);
}

socket.on('GestureSense',function(data)
{
    var success = document.getElementById("device_connection_section");
    success.innerHTML = data;
});

function changePage(newPage)
{
    location.href = newPage;
}