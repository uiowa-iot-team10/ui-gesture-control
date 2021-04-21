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
    var total_games_played = data.total_games_played;
    var total_games_won = data.total_games_won;
    var total_games_lost = data.total_games_lost;
    var connect4_wins = data.connect4_wins;
    var connect4_losses = data.connect4_losses;
    var tictactoe_wins = data.tictactoe_wins;
    var tictactoe_losses = data.tictactoe_losses;

    $('#total_games').html(total_games_played.toString());
    $('#total_games_won').html(total_games_won.toString());
    $('#total_games_lost').html(total_games_lost.toString());
    $('#rating').html(calculateRating(total_games_won,total_games_lost).toString());
    $('#connect4Win').html(connect4_wins.toString());
    $('#connect4Loss').html(connect4_losses.toString());
    $('#tictactoeWin').html(tictactoe_wins.toString());
    $('#tictactoeLoss').html(tictactoe_losses.toString());

    google.charts.load('current',{'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
});

function calculateRating(win,loss)
{
    var rating = (win*30)-(loss*10);
    if(rating < 500)
    {
        rating = 500;
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
  var options = {is3D: true,backgroundColor: 'transparent',colors:['blue','orange'],legend:{alignment: 'center', position: 'right', textStyle: {color:'white',fontSize:16}},chartArea:{width:'75%',height:'75%',right:10}};
  chart.draw(data,options);
}