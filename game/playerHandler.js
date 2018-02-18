const gameObjects = require('./gameObjects');
const Player = gameObjects.Player;

const exports = module.exports = function () {
    this.players = [];
    this.hasPlayer = function (name) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].name.toUpperCase() === name.toUpperCase()) return true;
        }
        return false;
    };
    this.addPlayer = function (name, ws) {
        const p = new Player(name, ws);
        this.players.push(p);
        return p;
    };
    this.removePlayer = function (name) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].name.toUpperCase() === name.toUpperCase()) {
                this.players.splice(i--, 1);
                return true;
            }
        }
        return false;
    };
};

