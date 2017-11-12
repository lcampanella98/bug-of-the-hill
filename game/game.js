var game = module.exports = {};
var PlayerHandler = require("./playerHandler");
var GameWorld = require("./gameWorld");

game.isStarted = false;
game.initialized = false;

var Admin = function(ws) {
    this.ws = ws;
    this.isOnline = function () {
        return this.ws.readyState === 1;
    }
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
    this.gameWorld = new GameWorld(this.playerHandler.players);
    this.broadcastMessage('start');
};

game.playerJoin = function (name, ws) {
    if (this.playerHandler.hasPlayer(name)) return false;
    this.playerHandler.addPlayer(name, ws);
    this.broadcastToAdmins('playerjoin;' + name);
    return true;
};

game.playerInGame = function (name) {
    return this.playerHandler.hasPlayer(name);
};

game.playerInput = function (name, input) {
    this.gameWorld.gotInput(name, input);
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
        if (this.admins[i].isOnline()) {
            this.admins[i].ws.send(data);
        } else this.admins.splice(i--, 1);
    }
};

game.broadcastMessage = function (data) {
    // broadcast to players
    var players = this.playerHandler.players;
    for (var i = 0; i < players.length; i++) {
        if (players[i].isOnline()) {
            players[i].ws.send(data);
        } else players.splice(i--, 1);
    }
    this.broadcastToAdmins(data);
};
