var gameObjects = require('./gameObjects');
var Player = gameObjects.Player;
var Projectile = gameObjects.Projectile;
var Turret = gameObjects.Turret;
var Hill = gameObjects.Hill;

var gameObjectHandler = require('./gameObjectHandler');


var world = module.exports = function (game, players, gameTimeLimit) {

    this.gameTimeLimit = gameTimeLimit;
    this.timeLeft = this.gameTimeLimit;
    this.timeTotal = 0;
    this.isGameOver = false;

    this.projectileList = [];
    this.king = null;
    this.hitTax = 20; // update this value
    this.worldWidth = 2000;
    this.worldHeight = 2000;
    this.playersList = players;

    this.defaultFireDelay = 400;
    this.kingFireDelay = 800;

    this.gotPlayerInput = function (name, input) {
        var p;
        for (var i = 0; i < players.length; i++ ) {
            p = players[i];
            if (p.name === name) {
                p.input = input;
            }
        }
    };
    //console.log(input);

    this.getDefaultProjectileDrawProps = function () {
        return {
            radius: 6,
            lineWidth: 2,
            fillColor: 'red',
            strokeColor: 'black'
        };
    };

    this.getKingProjectileDrawProps = function () {
        var obj = this.getDefaultProjectileDrawProps();
        obj.fillColor = 'green';
        return obj;
    };

    this.getHillDrawProps = function () {
        return {
            strokeColor: 'blue',
            lineWidth: 10
        };
    };

    this.getHillKingDrawProps = function () {
        return {
            strokeColor: 'red',
            lineWidth: 10
        };
    };

    this.fireProjectile = function (player) {
        var x = player.x, y = player.y, angle = player.a;
        var defSpeed = 300, defMaxDist = 280, kingSpeed = 350, kingMaxDist = 400;
        if (player.isKing) {
            var p1 = new Projectile(this.turretFront.x, this.turretFront.y, this.turretFront.angle, defSpeed, defMaxDist, player, this.getKingProjectileDrawProps());
            var p2 = new Projectile(this.turretRear.x, this.turretRear.y, this.turretRear.angle, defSpeed, defMaxDist, player, this.getKingProjectileDrawProps());
            this.projectileList.push(p1);
            this.projectileList.push(p2);
        } else {
            var proj = new Projectile(x, y, angle, defSpeed, defMaxDist, player, this.getDefaultProjectileDrawProps());
            this.projectileList.push(proj);
        }
    };

    this.randInt = function (ceil) {
        return Math.floor(Math.random() * ceil);
    };

    this.randIntBetween = function (floor, ceil) {
        return Math.floor(Math.random() * (ceil - floor) + floor);
    };

    this.playerLeave = function (player) {
        if (player.isKing) {
            this.kingKilled();
        }
    };

    this.initPlayer = function (player) {
        player.gameWorld = this;
        var side = this.randInt(4);
        var pad = 50;
        var x, y, angle;
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
        var randBugIndex = this.randInt(gameObjectHandler.bugs.length);
        var bug = gameObjectHandler.bugs[randBugIndex];
        player.init(x, y, angle, bug);
        player.setFireDelay(this.defaultFireDelay);
    };

    this.kingKilled = function () {
        var playerTemp = this.king;
        this.king = null;
        this.initPlayer(playerTemp);
        this.hill.drawProps = this.getHillDrawProps();
    };

    this.playerHit = function (player) {
        if (player.isKing) {
            player.health -= this.hitTax;
            if (player.health <= 0) {
                this.kingKilled();
            }
        } else {
            this.initPlayer(player);
        }
    };

    this.isInside = function (point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        var x = point[0], y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };

    this.projCollidingWithPlayer = function (projectile, player) {
        return this.isInside([projectile.x, projectile.y], player.getBoundingBox())
            && !(projectile.player.name === player.name); // player cannot be hit by own projectile
    };


    this.kingRotated = function (king) {
        this.turretFront.newAngle(king.a);
        this.turretRear.newAngle(king.a);
    };

    this.newKing = function (player) {
        player.x = this.hill.x;
        player.y = this.hill.y;
        player.a = this.turretFront.angle;
        player.isKing = true;
        this.king = player;
        this.king.setFireDelay(this.kingFireDelay);
        this.hill.drawProps = this.getHillKingDrawProps();
    };

    this.updateWorld = function (dt) {
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
        for (let i = 0; i < this.projectileList.length; i++) {
            this.projectileList[i].update(dt);
            if (this.projectileList[i].finished) this.projectileList.splice(i--, 1);
        }
        // step 2 check projectile collisions with players
        let proj, player;
        for (let i = 0; i < this.projectileList.length; i++) {
            proj = this.projectileList[i];
            for (let j = 0; j < this.playersList.length; j++) {
                player = this.playersList[j];
                if (this.projCollidingWithPlayer(proj, player)) {
                    this.playerHit(player);
                    this.projectileList.splice(j--, 1);
                }
            }

        }
        // step 3 process all input
        for (let i = 0; i < this.playersList.length; i++) {
            let p = this.playersList[i];
            p.update(dt);
        }

        // step 4 check for new king
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


    this.gameOver = function () {
        this.isGameOver = true;
        setTimeout(this.newGame.bind(this), 3000);
    };

    this.initPlayersNewGame = function () {
        for (let i = 0; i< this.playersList.length; i++) {
            this.initPlayer(this.playersList[i]);
            this.playersList[i].newGame();
        }
    };

    this.initPlayers = function () {
        for (let i = 0; i < this.playersList.length; i++) {
            this.initPlayer(this.playersList[i]);
        }
    };

    this.newGame = function () {
        this.initPlayersNewGame();
        this.timeLeft = this.gameTimeLimit;
        this.timeTotal = 0;
        this.king = null;
        this.isGameOver = false;
        this.hill.drawProps = this.getHillDrawProps();
    };

    this.newGame();

    this.hill = new Hill(this.worldWidth / 2, this.worldHeight / 2, 60, 150, this.getHillDrawProps());
    this.turretFront = new Turret(this.hill.x, this.hill.y, 32, true, null);
    this.turretRear = new Turret(this.hill.x, this.hill.y, 32, false, null);

};

