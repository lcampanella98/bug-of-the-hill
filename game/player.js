const SPAWN_WAIT_TIME = 1000;

function Player (name, ws, gameWorld) {
    this.name = name;
    this.ws = ws;
    this.gameWorld = gameWorld;
    this.timeSinceDeath = SPAWN_WAIT_TIME;

    this.newGame();
}

Player.prototype.setGameWorld = function (gameWorld) {
    this.gameWorld = gameWorld;
};

Player.prototype.setBug = function (bug) {
    this.bug = bug;
    this.bug.player = this;
};

Player.prototype.getBug = function () {
    return this.bug;
};

Player.prototype.hasLiveBug = function () {
    return this.bug !== null && !this.bug.isDead();
};

Player.prototype.bugKilled = function () {
    if (this.isKing()) {
        this.gameWorld.kingKilled();
    }
    this.timeSinceDeath = 0;
    // this.gameWorld.spawnPlayerRandomBug(this);
    // this.bug = null;
};

Player.prototype.isKing = function () {
    return this.bug !== null && this.bug.isKingBug();
};

Player.prototype.update = function (dt) {
    if (this.hasLiveBug()) {
        this.bug.update(dt);
    } else {
        this.timeSinceDeath += dt;
        if (this.shouldSpawn()) {
            this.spawn();
        }
    }

    if (this.isKing()) {
        this.timeAsKing += dt;
    }
};

Player.prototype.gotInput = function (input) {
    if (this.bug !== null) {
        this.bug.setInputObj(input);
    }
};

Player.prototype.getDefaultInputObj = function () {
    return {"l":false,"r":false,"u":false,"d":false,"s":false};
};

Player.prototype.newGame = function () {
    this.spawn();
    this.timeAsKing = 0;
};

Player.prototype.isOnline = function () {
    return this.ws.readyState === 1;
};

Player.prototype.leave = function () {
    this.bug = null;
    this.gameWorld.playerLeave(this);
};

Player.prototype.getDrawableGameComponents = function () {
    return this.bug.getDrawableGameComponents();
};

Player.prototype.shouldSpawn = function () {
    return this.timeSinceDeath >= SPAWN_WAIT_TIME;
};

Player.prototype.spawn = function () {
    this.gameWorld.spawnPlayerRandomBug(this);
    this.timeSinceDeath = 0;
};

Player.prototype.getMetaData = function () {
    return {
        name: this.name,
        bugName: this.bug.bugType,
        maxHealth: this.bug.maxHealth,
        health: this.bug.health,
        x: this.bug.x,
        y: this.bug.y,
        a: this.bug.a,
        timeAsKing: this.timeAsKing
    };
};

module.exports = Player;


