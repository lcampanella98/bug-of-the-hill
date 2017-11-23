var express = require('express');
var router = express.Router();

var game = require('../game/game');
var gameObjectHandler = require('../game/gameObjectHandler');

var sendMsg = function (ws, msg) {
    ws.send(JSON.stringify({msg: msg}));
};

var validateName = function (name) {
    return name.length > 1;
};

router.ws('/', function (ws, req) {
    ws.on('message', function(message) {
        var data = JSON.parse(message);
        var badMessage = function () {sendMsg(ws, 'badmessage')};
        if (!data.hasOwnProperty('msg')) badMessage();
        var msg = data.msg.toLowerCase();
        var nameTaken = function () {sendMsg(ws, 'nametaken')};
        var invalidName = function () {sendMsg(ws, 'nameinvalid')};
        var success = function () {
            ws.send(JSON.stringify({msg:'joinsuccess', gameObjects: gameObjectHandler.allGameObjects}));
        };
        if (game.initialized) {
            if (msg === 'join') { // player join
                if (!data.hasOwnProperty('name') || !validateName(data.name)) invalidName();
                else {
                    var result = game.playerJoin(data.name, ws);
                    if (result) {
                        success();
                        if (game.isStarted) sendMsg(ws, 'start');
                    }
                    else nameTaken();
                }
            } else if (msg === 'input') {
                if (!data.hasOwnProperty('name') || !validateName(data.name)) invalidName();
                else if (!data.hasOwnProperty('input') || !game.playerInGame(data.name)) badMessage();
                else {
                    game.playerInput(data.name, data.input);
                }
            }
        } else {
            sendMsg(ws, 'wait');
        }
    })
});

module.exports = router;