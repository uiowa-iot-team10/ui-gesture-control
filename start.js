var spawn = require("child_process").spawn;
      
    // Parameters passed in spawn -
    // 1. type_of_script
    // 2. list containing Path of the script
    //    and arguments for the script 
      
    // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will
    // so, first name = Mike and last name = Will
var process = spawn('python3',["./tictactoe.py",
                        "0,0,0,0,0,0,0,0,0",
                        "dummy"] );
// To convert the 3x3 board to a 1x9 board, please use the following indices:
// 0 | 1 | 2
// - | - | -
// 3 | 4 | 5
// - | - | -
// 6 | 7 | 8
// 1 = Player 1 move
// -1 = Player 2 move

// Takes stdout data from script which executed
// with arguments and send this data to res object
process.stdout.on('data', function(data) {
    console.log(data.toString());
});

