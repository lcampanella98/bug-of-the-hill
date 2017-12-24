var express = require('express');
var router = express.Router();

var game = require('../game/game');
game.init();
game.start();

router.ws('/', function (ws, req) {
    ws.on('message', function(message) {
        var data = JSON.parse(message);
        var msg = data.msg.toLowerCase();
        if (msg === 'admin') {
            if (!game.initialized) game.init();
            if (!game.isStarted) game.start();
            game.adminJoin(ws);
        }
        else if (msg === 'start') {
            if (!game.initialized) game.init();
            if (!game.isStarted) game.start();
        }
    });
});

router.get('/', function(req, res, next) {
    res.render('admin', {title: 'COTH Admin'});
});

module.exports = router;