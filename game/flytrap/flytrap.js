const gameConfig = require('../gameConfigHandler');
const DrawableComponent = gameConfig.DrawableComponent;

const OPEN_TIME = 500;
const CLOSE_TIME = 200;
const MAX_WAIT_TIME = 5000;

const REMOVE_TIME = 500;

const TRAP_RADIUS = 38;

function Flytrap (gameWorld, x, y, a) {
    this.gameWorld = gameWorld;

    this.x = x;
    this.y = y;
    this.a = a;

    this.sprites = gameConfig.flytrapSprites;
    this.spriteIdx = 0;

    this.justSpawned = true;

    this.isOpening = false;
    this.isClosing = false;
    this.isWaiting = false;

    this.shouldRemove = false;

    this.caughtPlayers = [];
    this.caughtPlayerDistances = [];
}

Flytrap.prototype.getDrawableGameComponents = function () {
    const comp = new DrawableComponent();
    const sprite = this.sprites[this.spriteIdx];
    comp.isImageObj = true;
    comp.id = sprite.id;
    comp.x = this.x;
    comp.y = this.y;
    comp.a = this.a;
    comp.w = sprite.width;
    comp.h = sprite.height;
    return [comp];
};

Flytrap.prototype.closeTrap = function () {

    for (let i = 0; i < this.caughtPlayers.length; ++i) {
        if (this.caughtPlayers[i].hasLiveBug()){
            this.caughtPlayers[i].bug.setHealth(0);
        }
    }
};

Flytrap.prototype.update = function (dt) {
    if (this.justSpawned) {
        this.justSpawned = false;
        this.isOpening = true;
        this.t = 0;
    }
    if (this.isOpening) {
        // loop through opening sprites until done
        if ((this.t += dt) > OPEN_TIME) this.t = OPEN_TIME;
        const done = this.t >= OPEN_TIME;
        this.spriteIdx = this.sprites.length - 1 - Math.round(this.t / OPEN_TIME * (this.sprites.length - 1));
        if (done) {
            this.isOpening = false;
            this.isWaiting = true;
            this.t = 0;
        }
    }
    else if (this.isClosing) {
        // loop through sprites until done
        if ((this.t += dt) > CLOSE_TIME) this.t = CLOSE_TIME;
        const done = this.t >= CLOSE_TIME;
        this.spriteIdx = Math.round(this.t / CLOSE_TIME * (this.sprites.length - 1));
        if (done) {
            this.isClosing = false;
            this.remove = true;
            this.t = 0;
        }

    } else if (this.isWaiting) {
        // check if trap is done waiting
        if ((this.t += dt) > MAX_WAIT_TIME) this.t = MAX_WAIT_TIME;
        const done = this.t >= MAX_WAIT_TIME;
        if (done) {
            this.isWaiting = false;
            this.isClosing = true;
            this.t = 0;
            this.closeTrap();
        } else {
            // check for new players and existing player movement
            const players = this.gameWorld.players;
            for (let i = 0; i < players.length; ++i) {
                this.checkCatchPlayer(players[i]);
            }
            // check for player attempting escape
            for (let i = 0; i < this.caughtPlayers.length; ++i) {
                if (!this.caughtPlayers[i].hasLiveBug()) continue;
                const newDist = this.getDistFromTrap(this.caughtPlayers[i]);
                const oldDist = this.caughtPlayerDistances[i];
                if (newDist > oldDist) { // player trying to escape
                    this.isWaiting = false;
                    this.isClosing = true;
                    this.t = 0;
                    this.closeTrap();
                }
            }
        }
    } else if (this.remove) {
        if ((this.t += dt) > REMOVE_TIME) this.t = REMOVE_TIME;
        const done = this.t >= REMOVE_TIME;
        if (done) {
            this.shouldRemove = true;
            this.remove = false;
        }
    }

};

Flytrap.prototype.shouldRemoveTrap = function () {
    return this.shouldRemove;
};

Flytrap.prototype.checkCatchPlayer = function (player) {
    if (this.caughtPlayers.includes(player)) return;
    if (!player.hasLiveBug()) return;
    const dist = this.getDistFromTrap(player);
    if (dist <= TRAP_RADIUS) {
        this.caughtPlayers.push(player);
        this.caughtPlayerDistances.push(dist);
    }
};

Flytrap.prototype.getDistFromTrap = function (player) {
    const bug = player.getBug();
    return Math.hypot(this.x - bug.x, this.y - bug.y);
};

module.exports = Flytrap;