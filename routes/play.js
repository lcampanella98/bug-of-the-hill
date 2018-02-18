const express = require('express');
const router = express.Router();

const game = require('../game/game');
const gameImageObjectHandler = require('../game/gameImageObjectHandler');

const sendMsg = function (ws, msg) {
    ws.send(JSON.stringify({msg: msg}));
};

const validateName = function (name) {
    return name.length > 1;
};

router.ws('/', function (ws, req) {
    ws.on('message', function(message) {
        const data = JSON.parse(message);
        const badMessage = function () {sendMsg(ws, 'badmessage')};
        if (!data.hasOwnProperty('msg')) badMessage();

        const msg = data.msg.toLowerCase();
        const nameTaken = function () {sendMsg(ws, 'nametaken')};
        const invalidName = function () {sendMsg(ws, 'nameinvalid')};
        const success = function () {
            ws.send(JSON.stringify({msg:'joinsuccess', gameObjects: gameImageObjectHandler.allGameObjectsById}));
        };

        if (game.initialized) {
            if (msg === 'join') { // player join
                if (!data.hasOwnProperty('name') || !validateName(data.name)) invalidName();
                else {
                    const joinResult = game.playerJoin(data.name, ws);
                    if (joinResult) {
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