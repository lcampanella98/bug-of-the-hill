var express = require('express');
var router = express.Router();

var game = require('../game/game');

router.ws('/', function (ws, req) {
    ws.on('message', function(message) {
        if (message.toLowerCase() === 'admin') {
            game.init();
            game.adminJoin(ws);
        }
        else if (message.toLowerCase() === 'start') {
            game.start();
        }
    });
});

router.get('/', function(req, res, next) {
    res.render('admin', {title: 'COTH Admin'});
});

module.exports = router;