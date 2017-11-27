var gameObjects = require('./gameObjects');
var Player = gameObjects.Player;
var Projectile = gameObjects.Projectile;
var Turret = gameObjects.Turret;
var Hill = gameObjects.Hill;

var gameObjectHandler = require('./gameObjectHandler');
var GameComponent = gameObjectHandler.GameComponent;


var world = module.exports = function (game, players, gameTimeLimit) {

    this.game = game;
    this.gameTimeLimit = gameTimeLimit;
    this.timeLeft = this.gameTimeLimit;
    this.isGameOver = false;

    this.projectileList = [];
    this.king = null;
    this.hitTax = 10; // update this value
    this.worldWidth = 2000;
    this.worldHeight = 2000;
    this.playersList = players;
    this.dataObject = null;

    this.defaultFireDelay = 300;
    this.kingFireDelay = 600;

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
        var randCelebIdx = this.randInt(gameObjectHandler.celebs.length);
        var celeb = gameObjectHandler.celebs[randCelebIdx];
        player.init(x, y, angle, celeb);
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
            player.netWorth -= this.hitTax;
            if (player.netWorth <= 0) {
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

        var i;
        // step 1 update projectiles
        for (i = 0; i < this.projectileList.length; i++) {
            this.projectileList[i].update(dt);
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
                if (this.projCollidingWithPlayer(this.projectileList[j], p)) {
                    this.playerHit(p);
                    this.projectileList.splice(j--, 1);
                }
            }
        }
        // step 3 process all input

        for (i = 0; i < this.playersList.length; i++) {
            p = this.playersList[i];
            p.update(dt);
        }
        // step 4 check for new king
        if (this.king === null) {
            var minDist = 2147483647, newKing = null, dist;
            for (i = 0; i < this.playersList.length; i++) {
                p = this.playersList[i];
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

        if (this.timeLeft <= 0) {
            this.gameOver();
        }
        this.dataObject = this.generateDataObject();
    };


    this.generateDataObject = function () {
        var obj = {};
        obj.components = [];
        var i;
        for (i = 0; i < this.backgroundComponents.length; i++) {
            obj.components.push(this.backgroundComponents[i]);
        }
        for (i = 0; i < this.boundaryRects.length; i++) {
            obj.components.push(this.boundaryRects[i]);
        }
        obj.components.push(this.genTurretComponent(this.turretFront));
        obj.components.push(this.genTurretComponent(this.turretRear));
        obj.components.push(this.genHillComponent(this.hill));

        for (i = 0; i < this.playersList.length; i++) {
            obj.components.push(this.genPlayerComponent(this.playersList[i]));
        }
        for (i = 0; i < this.projectileList.length; i++) {
            obj.components.push(this.genProjectileComponent(this.projectileList[i]));
        }
        obj.kingData = this.king === null ? null : {
            name: this.king.name,
            celebName: this.king.celeb.name,
            netWorth: this.king.netWorth,
            kingTime: this.king.kingTime
        };
        var topKing;
        var topTime;
        var p;
        for (i = 0; i < this.playersList.length; i++) {
            p = this.playersList[i];
            if (p.kingTime > 0 && (topTime === undefined || p.kingTime > topTime)) {
                topKing = p;
                topTime = p.kingTime;
            }
        }
        obj.topKing = topKing === undefined ? null : {
            name: topKing.name,
            netWorth: topKing.netWorth,
            kingTime: topKing.kingTime,
            celebName: topKing.celeb.name
        };
        obj.gameTimeLeft = this.timeLeft;

        return obj;
    };

    this.genBoundryRects = function () {
        var x, y, w, h, offset = 10;
        var comps = [];
        var comp;
        for (var i = 0; i < 4; i++) {
            if (i === 0) {
                x = 0;
                y = this.worldHeight / 2;
                h = offset;
                w = this.worldHeight + offset;
            } else if (i === 1) {
                x = this.worldWidth;
                y = this.worldHeight / 2;
                h = offset;
                w = this.worldHeight + offset;
            } else if (i === 2) {
                x = this.worldWidth / 2;
                y = 0;
                h = this.worldWidth + offset;
                w = offset;
            } else if (i === 3) {
                x = this.worldWidth / 2;
                y = this.worldHeight;
                h = this.worldWidth + offset;
                w = offset;
            }
            comp = new GameComponent();
            comp.isRect = true;
            comp.fill = true;
            comp.fillColor = 'black';
            comp.x = x;
            comp.y = y;
            comp.w = w;
            comp.h = h;
            comps.push(comp);
        }
        return comps;
    };

    this.boundaryRects = this.genBoundryRects();

    this.genBackgroundComponents = function () {
        var xMax = this.worldWidth + 3000, yMax = this.worldHeight + 3000;
        var grid = gameObjectHandler.bgGrid;
        var comps = [];
        var comp;
        for (var x = this.worldWidth/2-xMax/2; x <= this.worldWidth/2+xMax/2; x += grid.width) {
            for (var y = this.worldHeight/2-yMax/2; y <= this.worldHeight/2+yMax/2; y += grid.height) {
                comp = new GameComponent();
                comp.id = grid.id;
                comp.x = x;
                comp.y = y;
                comp.a = 0;
                comp.isObj = true;
                comps.push(comp);
            }
        }
        return comps;
    };

    this.backgroundComponents = this.genBackgroundComponents();

    this.genPlayerComponent = function (player) {
        var comp = new GameComponent();
        comp.x = player.x;
        comp.y = player.y;
        comp.a = player.a;
        comp.isObj = true;
        comp.id = player.celeb.id;
        return comp;
    };

    this.genTurretComponent = function (turret) {
        var comp = new GameComponent();
        comp.x = turret.x;
        comp.y = turret.y;
        comp.a = turret.angle;
        comp.isObj = true;
        comp.id = gameObjectHandler.turret.id;
        return comp;
    };

    this.genProjectileComponent = function (proj) {
        var comp = new GameComponent();
        comp.x = proj.x;
        comp.y = proj.y;
        comp.a = proj.a;
        comp.isCircle = true;
        comp.fill = true;
        comp.stroke = true;
        comp.radius = proj.drawProps.radius;
        comp.fillColor = proj.drawProps.fillColor;
        comp.strokeColor = proj.drawProps.strokeColor;
        comp.lineWidth = proj.drawProps.lineWidth;
        return comp;
    };

    this.genHillComponent = function (hill) {
        var comp = new GameComponent();
        comp.x = hill.x;
        comp.y = hill.y;
        comp.a = 0;
        comp.radius = hill.playerWithinHillRadius;
        comp.isCircle = true;
        comp.stroke = true;
        comp.strokeColor = hill.drawProps.strokeColor;
        comp.lineWidth = hill.drawProps.lineWidth;
        return comp;
    };

    this.genTextComponent = function (x, y, font, text, color) {
        var comp = new GameComponent();
        comp.x = x;
        comp.y = y;
        comp.font = font;
        comp.isText = true;
        comp.text = text;
        comp.fillColor = color;
        return comp;
    };

    this.gameOver = function () {
        this.isGameOver = true;
    };

    for (var i = 0; i < this.playersList.length; i++) {
        this.initPlayer(this.playersList[i]);
    }

    this.hill = new Hill(this.worldWidth / 2, this.worldHeight / 2, 60, 150, this.getHillDrawProps());
    this.turretFront = new Turret(this.hill.x, this.hill.y, 32, true, null);
    this.turretRear = new Turret(this.hill.x, this.hill.y, 32, false, null);
};

