var gameObjects = require('./gameObjects');
var Player = gameObjects.Player;

var exports = module.exports = function(){
    this.players = [];
    this.hasPlayer = function (name) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].name.toUpperCase() === name.toUpperCase()) return true;
        }
        return false;
    };
    this.addPlayer = function (name, ws) {
        var p = new Player(name, ws);
        this.players.push(p);
        return p;
    };
    this.removePlayer = function (name) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].name.toUpperCase() === name.toUpperCase()) {
                this.players.splice(i--, 1);
                return true;
            }
        }
        return false;
    };
};

