const gameObjects = require('./gameWorldObjects');
const Player = require('./player');
const Projectile = require('./attacks/projectile');
const Turret = gameObjects.Turret;
const Hill = gameObjects.Hill;

const gameConfigHandler = require('./gameConfigHandler');

function GameWorld (players, gameTimeLimit) {
    this.gameTimeLimit = gameTimeLimit;
    this.timeLeft = this.gameTimeLimit;
    this.timeTotal = 0;
    this.isGameOver = false;

    this.projectileList = [];
    this.king = null;
    this.topKing = null;

    this.worldWidth = 2000;
    this.worldHeight = 2000;
    this.playersList = players;

    this.defaultFireDelay = 400;
    this.kingFireDelay = 800;

    this.initializeHill();
    this.turretFront = new Turret(this.hill.x, this.hill.y, 32, true, null);
    this.turretRear = new Turret(this.hill.x, this.hill.y, 32, false, null);

    this.newGame();
}

GameWorld.prototype.hasKingNow = function () {
    return this.king !== null;
};

GameWorld.prototype.gotPlayerInput = function (name, input) {
    let p;
    for (let i = 0; i < this.playersList.length; i++ ) {
        p = this.playersList[i];
        if (p.name === name) {
            p.gotInput(input);
        }
    }
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
    this.hill = new Hill(this.worldWidth / 2, this.worldHeight / 2, 60, 150, unoccupiedDrawProps, occupiedDrawProps);
};

GameWorld.prototype.addProjectile = function (projectile) {
    this.projectileList.push(projectile);
};

GameWorld.prototype.randInt = function (ceil) {
    return Math.floor(Math.random() * ceil);
};

GameWorld.prototype.randIntBetween = function (floor, ceil) {
    return Math.floor(Math.random() * (ceil - floor) + floor);
};

GameWorld.prototype.playerLeave = function (player) {
    if (player.isKing) {
        this.kingKilled();
    }
};

GameWorld.prototype.spawnPlayerRandomBug = function (player) {
    player.gameWorld = this;
    const side = this.randInt(4);
    const pad = 50;
    let x, y, angle;
    if (side === 0) { // spawn on bottom
        x = this.randIntBetween(pad, this.worldWidth - pad);
        y = pad;
        angle = Math.PI / 2;
    } else if (side === 1) { // spawn on right
        x = this.worldWidth - pad;
        y = this.randIntBetween(pad, this.worldHeight - pad);
        angle = Math.PI;
    } else if (side === 2) { // spawn on top
        x = this.randIntBetween(pad, this.worldWidth - pad);
        y = this.worldHeight - pad;
        angle = 3 * Math.PI / 2;
    } else if (side === 3) { // spawn on left
        x = pad;
        y = this.randIntBetween(pad, this.worldHeight - pad);
        angle = 0;
    }
    const randBugIndex = this.randInt(gameConfigHandler.bugs.length);
    const bug = gameConfigHandler.bugs[randBugIndex];
    player.init(x, y, angle, bug);
    player.setFireDelay(this.defaultFireDelay);
};

GameWorld.prototype.kingKilled = function () {
    const playerTemp = this.king;
    this.king = null;
    this.spawnPlayerRandomBug(playerTemp);
    this.hill.drawProps = this.getHillDrawProps();
};

GameWorld.prototype.kingRotated = function (king) {
    this.turretFront.newAngle(king.a);
    this.turretRear.newAngle(king.a);
};

GameWorld.prototype.newKing = function (player) {
    player.x = this.hill.x;
    player.y = this.hill.y;
    player.a = this.turretFront.angle;
    player.isKing = true;
    this.king = player;
    this.king.setFireDelay(this.kingFireDelay);
    this.hill.drawProps = this.getHillKingDrawProps();
};

GameWorld.prototype.updateWorld = function (dt) {
    if (this.isGameOver) return;
    // step 0 remove absent players
    for (let i = 0; i < this.playersList.length; ++i) {
        let p = this.playersList[i];
        if (!p.isOnline()) {
            this.playerLeave(p);
            this.playersList.splice(i--, 1);
        }
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
        for (let j = 0; j < this.playersList.length; ++j) {
            bug = this.playersList[j].bug;
            if (p.collidedWithBug(bug)) { // check if projectile hit bug
                bug.damage(p.getDamage());        // damage bug
                this.projectileList.splice(i--, 1); // remove projectile
                break;
            }
        }
    }

    // step 2 process all input
    for (let i = 0; i < this.playersList.length; i++) {
        let p = this.playersList[i];
        p.update(dt);
    }

    // step 3 check for new king
    if (this.king === null) {
        let minDist = 2147483647, newKing = null, dist;
        for (let i = 0; i < this.playersList.length; i++) {
            let p = this.playersList[i];
            dist = this.hill.distFromKingCenter(p);
            if (dist >= 0 && dist < minDist) {
                minDist = dist;
                newKing = p;
            }
        }
        if (newKing !== null) {
            this.newKing(newKing);
        }
    }

    this.timeLeft -= dt;
    this.timeTotal += dt;

    if (this.timeLeft <= 0) {
        this.gameOver();
    }
};


GameWorld.prototype.gameOver = function () {
    this.isGameOver = true;
    setTimeout(this.newGame.bind(this), 3000);
};

GameWorld.prototype.initPlayersNewGame = function () {
    for (let i = 0; i< this.playersList.length; i++) {
        this.spawnPlayerRandomBug(this.playersList[i]);
        this.playersList[i].newGame();
    }
};

GameWorld.prototype.initPlayers = function () {
    for (let i = 0; i < this.playersList.length; i++) {
        this.spawnPlayerRandomBug(this.playersList[i]);
    }
};

GameWorld.prototype.newGame = function () {
    this.initPlayersNewGame();
    this.timeLeft = this.gameTimeLimit;
    this.timeTotal = 0;
    this.king = null;
    this.isGameOver = false;
    this.hill.drawProps = this.getHillDrawProps();
};

module.exports = GameWorld;