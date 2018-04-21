const gameObjects = require('./gameWorldObjects');
const Player = require('./player');
const Projectile = require('./attacks/projectile');
const Turret = gameObjects.Turret;
const Hill = gameObjects.Hill;
const Ant = require('./bugs/bugAnt');
const Spider = require('./bugs/bugSpider');
const Bee = require('./bugs/bugBee');
const Cuttlefish = require('./bugs/cuttlefish');

const Flytrap = require('./flytrap/flytrap');

const mathtools = require('./mathtools');

const gameConfigHandler = require('./gameConfigHandler');

const BUGS = [
    Ant, Spider, Bee
];

this.font = "20px sans-serif";

function GameWorld (playerHandler, gameTimeLimit) {
    this.gameTimeLimit = gameTimeLimit;

    this.worldWidth = 2000;
    this.worldHeight = 2000;

    this.flytrapsPerSecond = gameConfigHandler.flytrapRate;

    this.playerHandler = playerHandler;
    this.players = playerHandler.players;

    for (let i = 0; i < this.players.length; ++i) {
        this.players[i].setGameWorld(this);
    }

    this.initializeHill();
    this.initializeTurrets();

    this.newGame();
}

GameWorld.prototype.hasKingNow = function () {
    return this.king !== null;
};

GameWorld.prototype.initializeTurrets = function () {
    this.turretFront = new Turret(this.hill.x, this.hill.y, 32, true, this);
    this.turretRear = new Turret(this.hill.x, this.hill.y, 32, false, this);
};

GameWorld.prototype.initializeHill = function () {
    const unoccupiedDrawProps = {
        strokeColor: 'blue',
        lineWidth: 10
    };
    const occupiedDrawProps = {
        strokeColor: 'red',
        lineWidth: 10
    };
    this.hill = new Hill(this.worldWidth / 2, this.worldHeight / 2, 60, 150, unoccupiedDrawProps, occupiedDrawProps, this);
};

GameWorld.prototype.addProjectile = function (projectile) {
    this.projectileList.push(projectile);
};


GameWorld.prototype.playerLeave = function (player) {
    if (this.topKing === player) this.topKing = null;
    if (this.king === player) this.king = null;
};

GameWorld.prototype.spawnPlayerRandomBug = function (player) {
    let bug = null;
    if (player.name.toLowerCase().startsWith('sarah')) {
        if (mathtools.randInt(2) === 0) bug = new Cuttlefish(player);
    }

    if (bug === null) {
        const randBugIndex = mathtools.randInt(BUGS.length);
        let RandBug = BUGS[randBugIndex];
        bug = new RandBug(player);
    }
    const side = mathtools.randInt(4);
    const pad = 50;
    let x, y, angle;
    if (side === 0) { // spawn on bottom
        x = mathtools.randIntBetween(pad, this.worldWidth - pad);
        y = pad;
        angle = Math.PI / 2;
    } else if (side === 1) { // spawn on right
        x = this.worldWidth - pad;
        y = mathtools.randIntBetween(pad, this.worldHeight - pad);
        angle = Math.PI;
    } else if (side === 2) { // spawn on top
        x = mathtools.randIntBetween(pad, this.worldWidth - pad);
        y = this.worldHeight - pad;
        angle = 3 * Math.PI / 2;
    } else if (side === 3) { // spawn on left
        x = pad;
        y = mathtools.randIntBetween(pad, this.worldHeight - pad);
        angle = 0;
    }
    bug.setPosition(x, y);
    bug.setAngle(angle);
    player.setBug(bug);
};

GameWorld.prototype.kingKilled = function () {
    this.king = null;
};

GameWorld.prototype.newKing = function (player) {
    player.bug.setPosition(this.hill.x, this.hill.y);
    player.bug.setAngle(this.turretFront.a);
    player.bug.crownKing();
    this.king = player;
};

GameWorld.prototype.spawnNewFlytrap = function () {
    let rnd = Math.random();
    const r0 = this.hill.playerWithinHillRadius, r1 = 800;
    const r = (r1 - r0) * rnd * rnd + r0;
    rnd = Math.random();
    const a = 2 * Math.PI * rnd;
    rnd = Math.random();
    const flytrapA = 2 * Math.PI * rnd;
    this.flytraps.push(new Flytrap(this, this.hill.x + r * Math.cos(a), this.hill.y + r * Math.sin(a), flytrapA));

};

GameWorld.prototype.updateWorld = function (dt) {
    if (this.isGameOver) return;
    // step 0 remove absent players
    this.playerHandler.cleanOfflinePlayers();



    // step 2 spawn players
    for (let i = 0; i < this.players.length; ++i) {
        if (this.players[i].shouldSpawn()) this.players[i].spawn();
    }

    // step 1 update projectiles
    let p;
    for (let i = 0; i < this.projectileList.length; ++i) {
        p = this.projectileList[i];
        p.update(dt);
        if (p.isDone()) {
            this.projectileList.splice(i--, 1);
            continue;
        }
        // check collisions with other bugs
        let bug;
        for (let j = 0; j < this.players.length; ++j) {
            if (p.getDamage() === undefined) continue;
            if (!this.players[j].hasLiveBug()) continue;
            bug = this.players[j].bug;
            if (p.collidedWithBug(bug)) { // check if projectile hit bug
                bug.giveDamage(p.getDamage());        // damage bug
                this.projectileList.splice(i--, 1); // remove projectile
                break;
            }
        }
    }


    // step 3 process all input
    for (let i = 0; i < this.players.length; i++) {
        let p = this.players[i];
        p.update(dt);
    }

    // spawn and update flytraps
    let rnd = Math.random();
    if (rnd > 0.000 && rnd < 1 / 60 / this.flytrapsPerSecond) {
        this.spawnNewFlytrap();
    }

    for (let i = 0; i < this.flytraps.length; ++i) {
        this.flytraps[i].update(dt);
        if (this.flytraps[i].shouldRemoveTrap()) {
            this.flytraps.splice(i--, 1);
        }
    }

    // update turrets
    this.turretFront.update(dt);
    this.turretRear.update(dt);

    // step 4 check for new king
    if (this.king === null) {
        let minDist = 2147483647, newKing = null, dist, bug;
        for (let i = 0; i < this.players.length; i++) {
            if (!this.players[i].hasLiveBug()) continue;
            bug = this.players[i].bug;
            dist = this.hill.distFromKingCenter(bug);
            if (dist >= 0 && dist < minDist) {
                minDist = dist;
                newKing = bug;
            }
        }
        if (newKing !== null) {
            this.newKing(newKing.player);
        }
    }

    // step 5 check for new top king
    if (this.king !== null &&
        (this.topKing === null || this.king.timeAsKing > this.topKing.timeAsKing)) {
        this.topKing = this.king;
    }

    this.timeLeft -= dt;

    if (this.timeLeft <= 0) {
        this.gameOver();
    }
};


GameWorld.prototype.gameOver = function () {
    this.isGameOver = true;
    setTimeout(this.newGame.bind(this), 3000);
};

GameWorld.prototype.initPlayersNewGame = function () {
    for (let i = 0; i< this.players.length; i++) {
        this.players[i].newGame();
    }
};

GameWorld.prototype.newGame = function () {
    this.timeLeft = this.gameTimeLimit;
    this.king = null;
    this.topKing = null;
    this.isGameOver = false;
    this.projectileList = [];
    this.flytraps = [];

    this.initPlayersNewGame();
};

module.exports = GameWorld;
