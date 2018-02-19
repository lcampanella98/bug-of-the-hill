const gameObjects = require('./gameWorldObjects');
const Player = gameObjects.Player;

function PlayerHandler () {
    this.players = [];
}

PlayerHandler.prototype.hasPlayer = function (name) {
    for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].name.toUpperCase() === name.toUpperCase()) return true;
    }
    return false;
};
PlayerHandler.prototype.addPlayer = function (name, ws) {
    const p = new Player(name, ws);
    this.players.push(p);
    return p;
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

module.exports = PlayerHandler;