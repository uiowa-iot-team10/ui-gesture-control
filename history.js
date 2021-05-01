const express = require('express');
const path    = require('path');
const util    = require('util');
var rdb       = require( './rdb' );

const router  = express.Router();

const get_info = async (req, res, next) => {
    try {
        var userHex = req.params.userHex;
        console.log("###########");
        console.log("Converting Hex to ASCII...");
        var username = "";
        for (let index = 0; index < userHex.length - 1; index+=2)
            username += String.fromCharCode(parseInt(userHex.substring(index, index + 2), 16));
        rdb.database.ref(util.format("users/%s", username.replace(/[.#$\[\]]/g,'-'))).get().then((snapshot) =>
        {
            var stats = {};
            if (snapshot.val()) {
                stats = {
                    'total_games_played': snapshot.val().TotalGamesPlayed,
                    'total_games_won': snapshot.val().TotalGamesWon,
                    'total_games_lost': snapshot.val().TotalGamesLost,
                    'connect4_wins': snapshot.val().Connect4Wins,
                    'connect4_losses': snapshot.val().Connect4Losses,
                    'tictactoe_wins': snapshot.val().TicTacToeWins,
                    'tictactoe_losses': snapshot.val().TicTacToeLosses,
                    'tttRating': snapshot.val().tttRating,
                    'c4Rating': snapshot.val().c4Rating,
                    'progress': snapshot.val().progress
                };
                console.log("Successful!");
            } else console.log("No data returned!");
            console.log("###########");
            console.log("");
            res.json(stats);
        });
    } catch (error) {
        console.log("Error while testing: " + error);
        // next(error);
        res.json({
            'error': error.code
        });
    }
};

router
  .route('/api/v1/history/:userHex(*)')
  .get(get_info);

module.exports = router;
