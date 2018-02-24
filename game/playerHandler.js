const Player = require('./player');

function PlayerHandler () {
    this.players = [];
}

PlayerHandler.prototype.hasPlayer = function (name) {
    for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].name.toUpperCase() === name.toUpperCase()) return true;
    }
    return false;
};
PlayerHandler.prototype.addPlayer = function (name, ws, gameWorld) {
    const p = new Player(name, ws, gameWorld);
    this.players.push(p);
};

PlayerHandler.prototype.removePlayer = function (name) {
    for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].name.toUpperCase() === name.toUpperCase()) {
            this.players.splice(i--, 1);
            return true;
        }
    }
    return false;
};

PlayerHandler.prototype.cleanOfflinePlayers = function () {
    for (let i = 0; i < this.players.length; ++i) {
        if (!this.players[i].isOnline()) {
            this.players[i].leave();
            this.players.splice(i--, 1);
        }
    }
};

PlayerHandler.prototype.getPlayer = function (name) {
    for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].name.toUpperCase() === name.toUpperCase()) {
            return this.players[i];
        }
    }
    return null;
};

module.exports = PlayerHandler;