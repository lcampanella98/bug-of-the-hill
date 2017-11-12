var game = module.exports = {};
var PlayerHandler = require("./playerHandler");

game.isStarted = false;
game.initialized = false;

var Admin = function(ws) {
    this.ws = ws;
};

game.admins = [];

game.adminJoin = function(ws) {
    game.admins.push(new Admin(ws));
};

game.init = function () {
    this.playerHandler = new PlayerHandler();
    this.isStarted = false;
    this.initialized = true;
};

game.start = function () {
    this.isStarted = true;
    this.broadcastMessage('start');
};

game.playerJoin = function (name, ws) {
    if (this.playerHandler.hasPlayer(name)) return false;
    this.playerHandler.addPlayer(name, ws);
    this.broadcastToAdmins('playerjoin;' + name);
    return true;
};

game.sendNextFrame = function () {
    var players = this.playerHandler.players;
    for (var i = 0; i < players.length; i++) {
        var ws = players[i].ws;
        // send data
    }
};

game.broadcastToAdmins = function (data) {
    for (var i = 0; i < this.admins.length; i++) {
        if (this.admins[i].ws.readyState === 1) {
            this.admins[i].ws.send(data);
        } else this.admins.splice(i, 1);
    }
};

game.broadcastMessage = function (data) {
    // broadcast to players
    var players = this.playerHandler.players;
    for (var i = 0; i < players.length; i++) {
        if (players[i].ws.readyState === 1) {
            players[i].ws.send(data);
        } else players.splice(i, 1);
    }
    this.broadcastToAdmins(data);
};
