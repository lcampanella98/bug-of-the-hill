var express = require('express');
var router = express.Router();

var game = require('../game/game');

router.ws('/', function (ws, req) {
    ws.on('message', function(message) {
        if (game.initialized && ! game.isStarted) {
            var parts = message.split(';');
            if (parts[0].toLowerCase() === 'join') { // player join
                var fail = function () {ws.send('taken');};
                var success = function () {ws.send('success');};
                if (parts.length === 0) fail();
                else {
                    var result = game.playerJoin(parts[1], ws);
                    if (result) success();
                    else fail();
                }
            }
        } else if (game.initialized && game.isStarted) {
            // main game logic
            var data = JSON.parse(message);
            if (data.msg.toLowerCase() === 'input') {
                // process input l,r, u,d, s

            }
        } else if (!game.initialized) {
            ws.send('fail');
        }
    })
});

module.exports = router;