firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		window.location.replace("/login");
	} else if (user && !user.emailVerified) {
		// TO-DO: Put an alert to inform user to verify their account
		window.confirm("VERIFY YOUR EMAIL!!!!");
		sign_out();
		window.location.replace("/login");
	}
	else {
        $("#welcome_message").text(user.displayName);
        var config = {
            'email': user.email
        };
        socket.emit('get_user_game_data',config);
		make_visible();
	}
});

var socket = io();


socket.on("room_ready", (data) => {
    sessionStorage.setItem("rid", data.rid);
    sessionStorage.setItem("pid", data.pid);
    sessionStorage.setItem("game", data.game);
    window.location.replace("/waiting_room");
});

function sign_out() {
	firebase.auth().signOut().then(() => {
		window.location.assign("/login");
	}).catch((error) => {
		alert("[ERROR] Could not sign out: " + error.message);
	});
}

function make_visible() {
	$("#content").removeAttr('hidden');
}

function create_room() {
    var d = new Date();
    var rn = document.querySelector("#room-name");
    var rg = document.querySelector("#room-game");
    var config = {
        'username': firebase.auth().currentUser.email,
        'displayName': firebase.auth().currentUser.displayName,
        'rname': rn.value,
        'time': d.getTime(),
        'game': rg.options[rg.selectedIndex].text
    };
    console.log(config);
    socket.emit("create_room", config);
}

socket.on('send_user_game_data', (data) =>
{
    $('#total_games').html(data.total_games_played.toString());
    $('#total_games_won').html(data.total_games_won.toString());
    $('#total_games_lost').html(data.total_games_lost.toString());
    $('#rating').html(calculateRating(data.total_games_won,data.total_games_lost).toString());
    $('#connect4Win').html(data.connect4_wins.toString());
    $('#connect4Loss').html(data.connect4_losses.toString());
    $('#tictactoeWin').html(data.tictactoe_wins.toString());
    $('#tictactoeLoss').html(data.tictactoe_losses.toString());

    google.charts.load('current',{'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
});

function calculateRating(win,loss)
{
    var rating = 500 + ((win*30)-(loss*10));
    if(rating < 500)
    {
        rating = 500;
    }
    if(rating > 10000)
    {
        rating = 10000
    }
    return rating;
}

function drawChart()
{
  var data = google.visualization.arrayToDataTable([
  ['Task','Win/Loss Ratio'],
  ['Wins', parseInt($('#total_games_won').html())],
  ['Losses', parseInt($('#total_games_lost').html())]
]);
  var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  var options = {is3D: true,backgroundColor: 'transparent',colors:['blue','red'],legend:{alignment: 'center', position: 'right', textStyle: {color:'white',fontSize:16}},chartArea:{width:'75%',height:'75%',right:10}};
  chart.draw(data,options);
}