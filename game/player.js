function Player (name, ws, gameWorld) {
    this.name = name;
    this.ws = ws;
    this.timeAsKing = 0;
    this.gameWorld = gameWorld;

}

Player.prototype.setBug = function (bug) {
    this.bug = bug;
    this.bug.player = this;
};

Player.prototype.getBug = function () {
    return this.bug;
};

Player.prototype.bugKilled = function () {
    if (this.isKing()) {
        this.gameWorld.kingKilled();
    }
};

Player.prototype.isKing = function () {
    return this.bug !== undefined && this.bug.isKingBug();
};

Player.prototype.update = function (dt) {
    if (this.bug !== undefined) {
        this.bug.update(dt);
    }

    if (this.isKing()) {
        this.timeAsKing += dt;
    }
};

Player.prototype.gotInput = function (input) {
    if (this.bug !== undefined) {
        this.bug.setInputObj(input);
    }
};

Player.prototype.getDefaultInputObj = function () {
    return {"l":false,"r":false,"u":false,"d":false,"s":false};
};

Player.prototype.newGame = function () {
    this.bug = null;
    this.timeAsKing = 0;
};

Player.prototype.isOnline = function () {
    return this.ws.readyState === 1;
};

Player.prototype.getDrawableGameComponents = function () {
    return this.bug !== undefined ? this.bug.getDrawableGameComponents() : [];
};

Player.prototype.getMetaData = function () {
    return {
        playerName: this.name,
        bugType: this.bug.bugType,
        maxHealth: this.bug.maxHealth,
        health: this.bug.health,

    };
};

module.exports = Player;


