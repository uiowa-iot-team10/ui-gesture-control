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


buttons = ['homeButton','navbarDropdownMenuLink','myModal','statsButton','navbarDropdownMenuLink3','navbarDropdownMenuLink2'];
var i = 0;
function setNewFocus(direction){
    var currentLocation = $('#'+buttons[i]).attr('class');
    
    // single player selection
    if(buttons[i] == 'navbarDropdownMenuLink' && currentLocation == 'nav-link dropdown-toggle active clicked'){
        if(direction == 'RIGHT'){
            $('#singleTTT').attr('class','dropdown-item');
            $('#singleC4').attr('class','dropdown-item active');
        }
        if(direction == 'LEFT'){
            $('#singleTTT').attr('class','dropdown-item active');
            $('#singleC4').attr('class','dropdown-item');
        }
        if(direction == 'INPUT'){
            if($('#singleTTT').attr('class') == 'dropdown-item active'){
                $('#singleTTT')[0].click();
            } 
            else{
                $('#singleC4')[0].click();
            }
        }
        if(direction == 'UP'){
            $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active'); 
            $('#singleTTT').attr('class','dropdown-item');
            $('#singleC4').attr('class','dropdown-item');
            $('#'+buttons[i]).blur();
            document.getElementById('singlePlayerDropdown').classList.remove('show');  
        }
    }
     // leaderboard selection
    else if(buttons[i] == 'navbarDropdownMenuLink3' && currentLocation == 'nav-link dropdown-toggle active clicked'){
        if(direction == 'RIGHT'){
            $('#leaderTTT').attr('class','dropdown-item');
            $('#leaderC4').attr('class','dropdown-item active');
        }
        if(direction == 'LEFT'){
            $('#leaderTTT').attr('class','dropdown-item active');
            $('#leaderC4').attr('class','dropdown-item');
        }
        if(direction == 'INPUT'){
            if($('#leaderTTT').attr('class') == 'dropdown-item active'){
                $('#leaderTTT')[0].click();
            } 
            else{
                $('#leaderC4')[0].click();
            }
        }
        if(direction == 'UP'){
            $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active'); 
            $('#leaderTTT').attr('class','dropdown-item');
            $('#leaderC4').attr('class','dropdown-item');
            $('#'+buttons[i]).blur();
            document.getElementById('leaderboardDropdown').classList.remove('show');  
        }
    }
    // settings selection
    else if(buttons[i] == 'navbarDropdownMenuLink2' && currentLocation == 'nav-link dropdown-toggle active clicked') {
        if(direction == 'RIGHT'){
            $('#bluetoothSetting').attr('class','dropdown-item');
            $('#signOutSetting').attr('class','dropdown-item active');
        }
        if(direction == 'LEFT'){
            $('#bluetoothSetting').attr('class','dropdown-item active');
            $('#signOutSetting').attr('class','dropdown-item');
        }
        if(direction == 'INPUT'){
            if($('#bluetoothSetting').attr('class') == 'dropdown-item active'){
                $('#bluetoothSetting')[0].click();
            } 
            else{
                $('#signOutSetting')[0].click();
            }
        }
        if(direction == 'UP'){
            $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active'); 
            $('#bluetoothSetting').attr('class','dropdown-item');
            $('#signOutSetting').attr('class','dropdown-item');
            $('#'+buttons[i]).blur();
            document.getElementById('settingsDropdown').classList.remove('show');  
        }
    }
    else{
        if (direction == 'RIGHT'){
            i += 1;
            if(i == 6){
                i -= 1;
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
            }
            else{
                // single player button
                if(buttons[i] == 'navbarDropdownMenuLink') {
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
                // create room button
                else if(buttons[i] == 'myModal') {
                    $('#'+buttons[i-1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'statsButton'){
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                // leaderboard button
                else if(buttons[i] == 'navbarDropdownMenuLink3') {
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
                // settings button
                else if(buttons[i] == 'navbarDropdownMenuLink2') {
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
            } 
        }
        if (direction == 'LEFT'){
            i -= 1;
            if(i == -1){
                i += 1;
                $('#'+buttons[i]).attr('class','nav-link active');
            }
            else{
                if(buttons[i] == 'navbarDropdownMenuLink'){
                    $('#'+buttons[i+1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
                else if(buttons[i] == 'myModal'){
                    $('#'+buttons[i+1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'statsButton'){
                    $('#'+buttons[i+1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'homeButton'){
                    $('#'+buttons[i+1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'navbarDropdownMenuLink3'){
                    $('#'+buttons[i+1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
            }
        }
        if(direction == 'INPUT'){
            $('#'+buttons[i])[0].click();
            if(buttons[i] == 'navbarDropdownMenuLink'){
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active clicked');
            }
            if(buttons[i] == 'navbarDropdownMenuLink2'){
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active clicked');
            }
            if(buttons[i] == 'navbarDropdownMenuLink3'){
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active clicked');
            }
        }
    }
}

socket.on('gesture', function(data){
    console.log(data);
    setNewFocus(data);
});

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
    if(parseInt($('#total_games_won').html()) || parseInt($('#total_games_lost').html()))
    {
        var data = google.visualization.arrayToDataTable([
            ['Task','Win/Loss Ratio'],
            ['Wins', parseInt($('#total_games_won').html())],
            ['Losses', parseInt($('#total_games_lost').html())]
            ]);
            var chart= new google.visualization.PieChart(document.getElementById('piechart'));
            var options = {is3D: true, backgroundColor: 'transparent',colors:['blue','red'],legend:{alignment: 'center', position: 'bottom', textStyle: {color:'white',fontSize:16}},chartArea:{width:'100%',height:'70%',right:10}};
            chart.draw(data,options);
            console.log(user_data);
    }
    else
    {
        document.getElementById('piechartdiv').style.display = 'none';
        document.getElementById('curve_chartdiv').classList.remove('me-auto');  
        document.getElementById('curve_chartdiv').classList.add('mx-auto'); 
    }
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