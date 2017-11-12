var gameObjects = require('gameObjects');
var Player = gameObjects.Player;
var Projectile = gameObjects.Projectile;
var Turret = gameObjects.Turret;
var Hill = gameObjects.Hill;

var world = module.exports = function (players) {
    this.gotPlayerInput = function (name, input) {
        var p;
        for (var i = 0; i < players.length; i++ ) {
            p = players[i];
            if (p.name === name) {
                p.input = input;
            }
        }
    };

    this.projectileList = [];
    this.king = null;
    this.hitTax = 10; // update this value
    this.worldWidth = 10000;
    this.worldHeight = 10000;
    this.playersList = players;

    for (var i = 0; i < this.playersList.length; i++) this.playersList[i].gameWorld = this;
    this.hill = new Hill(this.worldWidth / 2, this.worldHeight / 2, 60, 200);
    this.turretFront = new Turret(this.hill.x, this.hill.y, 30, true, null);
    this.turretRear = new Turret(this.hill.x, this.hill.y, 30, true, null);


    this.getDefaultProjectileDrawProps = function () {
        return null; // change this!
    };

    this.getKingProjectileDrawProps = function () {
        return null; // change this!
    };

    this.fireProjectile = function (player) {
        var x = player.x, y = player.y, angle = player.angle;
        if (player.isKing) {
            var p1 = new Projectile(this.turretFront.x, this.turretFront.y, angle, 1.5, 20, player, this.getKingProjectileDrawProps());
            var p2 = new Projectile(this.turretRear.x, this.turretRear.y, angle, 1.5, 20, player, this.getKingProjectileDrawProps());
            this.projectileList.push(p1);
            this.projectileList.push(p2);
        } else {
            var proj = new Projectile(x, y, angle, 1.5, 20, player, this.getDefaultProjectileDrawProps());
            this.projectileList.push(proj);
        }
    };

    this.randInt = function (ceil) {
        return Math.floor(Math.random() * ceil);
    };

    this.randIntBetween = function (floor, ceil) {
        return Math.floor(Math.random() * (ceil - floor) + floor);
    };

    this.initPlayer = function (player) {
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
        var celebProps = null; // get celeb props
        player.init(x, y, angle, celebProps);
    };

    this.playerHit = function (player) {
        if (player.isKing) {
            player.netWorth -= this.hitTax;
            if (player.netWorth <= 0) {
                this.king = null;
                this.initPlayer(player);
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

    this.playerCanMoveTo = function (player) {
        var p;
        for (var i = 0; i < this.playersList.length; i++) {
            p = this.playersList[i];
            // check world bounds
            if (p.x < 0 || p.x > this.worldWidth) return false;
            if (p.y < 0 || p.y > this.worldHeight) return false;
            // check hill
            if (this.king === null && this.hill.isInsideHill(player)) return false;
        }
    };

    this.kingRotated = function (king) {
        this.turretFront.newAngle(king.a);
        this.turretRear.newAngle(king.a);
    };

    this.updateWorld = function () {
        var i;
        var dt = 4; // change this!!

        // step 1 update projectiles
        for (i = 0; i < this.projectileList.length; i++) {
            this.projectileList[i].update();
            if (this.projectileList[i].finished) this.projectileList.splice(i--, 1);
        }
        // step 2 check projectile collisions with players
        var p;
        for (i = 0; i < this.playersList.length; i++) {
            p = this.playersList[i];
            if (!p.isOnline()) {
                this.playersList.splice(i--, 1);
                continue;
            }
            for (var j = 0; j < this.projectileList.length; j++) {
                if (this.projCollidingWithPlayer(this.projectileList[j], p)) this.playerHit(p);
            }
        }
        // step 3 process all input

        for (i = 0; i < this.playersList.length; i++) {
            p = this.playersList[i];
            p.update(dt);
        }
        // step 4 check for new king
        if (this.king === null) {
            for (i = 0; i < this.playersList.length; i++) {
                p = this.playersList[i];

            }
        }

    }
};

