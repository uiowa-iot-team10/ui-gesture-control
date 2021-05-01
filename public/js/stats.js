firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		window.location.replace("/login");
	} else if (user && !user.emailVerified) {
		$('#staticBackdrop').modal('toggle');
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
	var user = firebase.auth().currentUser;
    firebase.auth().signOut().then(() => {
        if (user) {
            var today = new Date();
            var dd = String(today.getUTCDate()).padStart(2, '0');
            var mm = String(today.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getUTCFullYear();
            var h  = String(today.getUTCHours()).padStart(2, '0');
            var m  = String(today.getUTCMinutes()).padStart(2, '0');
            var s  = String(today.getUTCSeconds()).padStart(2, '0');
            var today_unix = Date.UTC(today.getUTCFullYear(),today.getUTCMonth(), today.getUTCDate(), 
            today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds());
            today = mm + '/' + dd + '/' + yyyy + ' ' + h + ':' + m + ':' + s;
            socket.emit("user_data_update", {
                'user': user.email,
                'activity': {
                    'signout': {
                        'time': today,
                        'time_unix': today_unix
                    }
                }
            });
        }
		window.location.assign("/login");
	}).catch((error) => {
		alert("[ERROR] Could not sign out: " + error.message);
	});
}

function make_visible() {
	$("#content").removeAttr('hidden');
}

function create_room() {
    var today = new Date();
    var dd = String(today.getUTCDate()).padStart(2, '0');
    var mm = String(today.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getUTCFullYear();
    var h  = String(today.getUTCHours()).padStart(2, '0');
    var m  = String(today.getUTCMinutes()).padStart(2, '0');
    var s  = String(today.getUTCSeconds()).padStart(2, '0');
    var today_unix = Date.UTC(today.getUTCFullYear(),today.getUTCMonth(), today.getUTCDate(), 
    today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds());
    today = mm + '/' + dd + '/' + yyyy + ' ' + h + ':' + m + ':' + s;
    var rn = document.querySelector("#room-name");
    var rg = document.querySelector("#room-game");
    var config = {
        'username': firebase.auth().currentUser.email,
        'displayName': firebase.auth().currentUser.displayName,
        'rname': rn.value,
        'time': today_unix,
        'date': today,
        'game': rg.options[rg.selectedIndex].text
    };
    socket.emit("create_room", config);
    socket.emit("user_data_update", {
        'user': firebase.auth().currentUser.email,
        'activity': {
            'create_room': {
                'time': today,
                'time_unix': today_unix,
                'game': rg.options[rg.selectedIndex].text
            }
        }
    });
}

var user_data = {};
socket.on('send_user_game_data', (data) =>
{
    user_data = {};
    $('#total_games').html(data.total_games_played.toString());
    $('#total_games_won').html(data.total_games_won.toString());
    $('#total_games_lost').html(data.total_games_lost.toString());
    $('#c4_rating').html(data.c4Rating.toString());
    $('#ttt_rating').html(data.tttRating.toString());
    $('#connect4Win').html(data.connect4_wins.toString());
    $('#connect4Loss').html(data.connect4_losses.toString());
    $('#tictactoeWin').html(data.tictactoe_wins.toString());
    $('#tictactoeLoss').html(data.tictactoe_losses.toString());

    user_data = data.progress;

    google.charts.load('current',{'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
});

function drawChart()
{
    var data = google.visualization.arrayToDataTable([
    ['Task','Win/Loss Ratio'],
    ['Wins', parseInt($('#total_games_won').html())],
    ['Losses', parseInt($('#total_games_lost').html())]
    ]);
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    var options = {is3D: true, backgroundColor: 'transparent',colors:['blue','red'],legend:{alignment: 'center', position: 'bottom', textStyle: {color:'white',fontSize:16}},chartArea:{width:'100%',height:'70%',right:10}};
    chart.draw(data,options);
    console.log(user_data);

    var progress = [['X', 'Connect4', 'Tic-Tac-Toe']];
    var last_c4Rating = 0;
    for (var i = 0; i < user_data["Connect4"].length; i++)
    {
        last_c4Rating = user_data["Connect4"][i];
        progress.push(["2021", last_c4Rating]);
    }
    var last_tttRating = 0;
    var counter = 0;
    for (var i = 0; i < user_data["TicTacToe"].length; i++)
    {
        last_tttRating = user_data["TicTacToe"][i];
        if (i < user_data["Connect4"].length) {
            progress[i + 1].push(last_tttRating);
        }
        else {
            progress.push(["2021", last_c4Rating, last_tttRating]);
        }
        counter++;
    }
    for (var i = counter; i < user_data["Connect4"].length; i++) {
        progress[i + 1].push(last_tttRating);
    }
    console.log(progress);

    var data = google.visualization.arrayToDataTable(progress);

    var options = {
        titleTextStyle: {color: "white", fontSize: 20},
        legend:{position: 'right', color:'white',fontSize:20},
        lineWidth: 5,
        series: {
            0: { lineDashStyle: [2, 2, 20, 2, 20, 2] },
            1: { lineDashStyle: [14, 2, 2, 7] }
        },
        chartArea:{width:'65%',height:'90%', 
            backgroundColor: {
            fill: '#FFFFF0',
            fillOpacity: 0.05
          }
        },
        backgroundColor: { fill:'transparent' },
        vAxis: {
            title: 'Rating',
            textStyle:{color: '#FFF'},
            titleTextStyle:{color: '#FFF'},
            gridlines: {color: '#787878'}
        },
        hAxis: {
            gridlines: {color: '#FFF'},
            textStyle:{color: '#FFF'},
            titleTextStyle:{color: '#FFF'}
        },
        legend:{
            textStyle:{color: '#FFF'}
        },
        axes: {
            x: {
              0: {side: 'top'}
            }
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
}