var Player = function (name, ws) {
    this.name = name;
    this.ws = ws;
    this.init = function (initHealth, initPos, initOrientation) {
        this.setHealth(initHealth);
        this.setPos(initPos);
        this.setOrientation(initOrientation);
    };
    this.setHealth = function (health) {
        this.health = health;
    };
    this.getPos = function() {return this.pos;};
    this.setPos = function (pos) {
        this.pos= pos;
    };
    this.getPos = function() {return this.pos;};
    this.setOrientation = function (orientation) {
        this.orientation = orientation;
    };
    this.getOrientation = function() {return this.orientation;};

};

var exports = module.exports = function(){
    this.players = [];
    this.hasPlayer = function (name) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].name.toUpperCase() === name.toUpperCase()) return true;
        }
        return false;
    };
    this.addPlayer = function (name, ws) {
        this.players.push(new Player(name, ws));
    };
    this.removePlayer = function (name) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].name.toUpperCase() === name.toUpperCase()) {
                this.players.splice(i, 1);
                return true;
            }
        }
        return false;
    };
};

