var express = require('express');
var router = express.Router();

var game = require('../game/game');
var gameObjectHandler = require('../game/gameObjectHandler');

router.ws('/', function (ws, req) {
    ws.on('message', function(message) {
        var data = JSON.parse(message);
        var msg = data.msg.toLowerCase();
        if (game.initialized && !game.isStarted) {

            if (msg === 'join') { // player join
                var fail = function () {ws.send(JSON.stringify({msg:'taken'}));};
                var success = function () {
                    ws.send(JSON.stringify({msg:'success'}));
                    ws.send(JSON.stringify({msg:'loadobjects', gameObjects: gameObjectHandler.allGameObjects}));
                };
                if (!data.hasOwnProperty('name')) fail();
                else {
                    var result = game.playerJoin(data.name, ws);
                    if (result) success();
                    else fail();
                }
            }
        } else if (game.initialized && game.isStarted) {
            // main game logic
            if (data.hasOwnProperty('name') && game.playerInGame(data.name)) {
                if (msg === 'input' && data.hasOwnProperty('input')) {
                    // process input l,r, u,d, s
                    game.playerInput(data.name, data.input);
                }
            } else ws.send(JSON.stringify({msg:'alreadystarted'}));
        } else if (!game.initialized) {
            ws.send(JSON.stringify({msg:'wait'}));
        }
    })
});

module.exports = router;