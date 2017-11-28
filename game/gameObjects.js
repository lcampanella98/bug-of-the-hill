var gameObjectHandler = require('./gameObjectHandler');

var o = module.exports = {};

o.Player = function (name, ws) {
    this.name = name;
    this.ws = ws;
    this.kingTime = 0;
    this.gameWorld = null;

    this.init = function (x, y, angle, celeb) {
        this.x = x;
        this.y = y;
        this.a = angle;
        this.angularSpeed = 2.0;
        this.celeb = celeb;
        this.width = celeb.width;
        this.height = celeb.height;
        this.isKing = false;
        this.speed = 200.0;
        this.netWorth = celeb.netWorth;
        this.input = {"l":false,"r":false,"u":false,"d":false,"s":false};
        this.timeUntilNextFire = 0;
        this.fireDelay = 300;
    };

    this.setFireDelay = function (fireDelayMs) {
        this.fireDelay = fireDelayMs;
    };

    this.newGame = function () {
        this.kingTime = 0;
    };

    this.update = function (dt) {
        var ip = this.input;
        var l = ip.l, r = ip.r, u = ip.u, d = ip.d, s = ip.s;
        // forward/back motion
        var dx = 0, dy = 0;
        var vScale = this.speed * dt / 1000.0;
        if (!(u && d) && !this.isKing) {
            if (u) {
                dx = vScale * Math.cos(this.a);
                dy = vScale * Math.sin(this.a);
            } else if (d) {
                dx = - vScale * Math.cos(this.a);
                dy = - vScale * Math.sin(this.a);
            }
        }
        var newDeltas = this.getValidMovement(dx, dy);
        dx = newDeltas[0];
        dy = newDeltas[1];
        this.x += dx;
        this.y += dy;
        // rotation
        var da = 0;
        var angularSpeedScaled = this.angularSpeed * dt / 1000;
        if (!(l && r)) {
            if (l) da = angularSpeedScaled;
            else if (r) da = -angularSpeedScaled;
        }
        this.a += da;
        if (da !== 0 && this.isKing) this.gameWorld.kingRotated(this);
        // fire logic
        if (s && this.timeUntilNextFire <= 0) {
            this.gameWorld.fireProjectile(this);
            this.timeUntilNextFire = this.fireDelay;
        }
        else if (this.timeUntilNextFire > 0) this.timeUntilNextFire -= dt;
        if (this.isKing) {
            this.kingTime += dt;
        }
    };

    this.getValidMovement = function (dx, dy) {
        var newX = this.x + dx, newY = this.y + dy;
        var newDx = dx, newDy = dy;
        // check world bounds
        if (newX < 0 || newX > this.gameWorld.worldWidth) newDx = 0;
        if (newY < 0 || newY > this.gameWorld.worldHeight) newDy = 0;
        // check hill
        // player cannot move inside hill unless it is empty
        if (this.gameWorld.king !== null && this.gameWorld.hill.isInsideHill(this)) {
            newDx = 0;
            newDy = 0;
        }
        return [newDx, newDy];
    };

    this.getBoundingBox = function() {
        var hWidth = this.width / 2;
        var hHeight = this.height / 2;
        return [
            [this.x + hWidth, this.y + hHeight],
            [this.x - hWidth, this.y + hHeight],
            [this.x - hWidth, this.y - hHeight],
            [this.x + hWidth, this.y - hHeight]
        ];
    };

    this.isOnline = function () {
        return this.ws.readyState === 1;
    }
};

o.Projectile = function (x, y, angle, delDist, maxDist, player, drawProps) {
    this.x = x;
    this.y = y;
    this.a = angle;
    this.del = delDist;
    this.distTrav = 0.0;
    this.maxDist = maxDist;
    this.finished = false;
    this.drawProps = drawProps;
    this.player = player;
    // console.log('projectile fired');

    this.update = function (dt) {
        var dScaled = this.del * dt / 1000.0;
        //console.log('dscaled: ' + dScaled);
        this.distTrav += dScaled;
        if (this.distTrav >= this.maxDist) {
            // console.log('projectile finished');
            this.finished = true;
            return;
        }

        var dx = dScaled * Math.cos(this.a);
        var dy = dScaled * Math.sin(this.a);
        //console.log('bef: ' + this.x + ','+this.y);
        this.x += dx;
        this.y += dy;
        // console.log('aft: ' + this.x + ','+this.y);
    }
};

o.Hill = function (x, y, newKingWithinRadius, playerWithinHillRadius, drawProps) {
    this.x = x;
    this.y = y;
    this.newKingWithinRadius = newKingWithinRadius;
    this.playerWithinHillRadius = playerWithinHillRadius;
    this.drawProps = drawProps;

    this.moveOutsideHill = function (player) {
        var dx = player.x - this.x, dy = player.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= this.playerWithinHillRadius) return;
        player.x = this.x + dx * this.playerWithinHillRadius / dist;
        player.y = this.y + dy * this.playerWithinHillRadius / dist;
    };

    this.distFromKingCenter = function (player) {
        var dx = player.x - this.x, dy = player.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.newKingWithinRadius) return dist;
        return -1;
    };

    this.isInsideHill = function (player) {
        var dx = player.x - this.x, dy = player.y - this.y;
        return dx * dx + dy * dy < this.playerWithinHillRadius * this.playerWithinHillRadius;
    }

};

o.Turret = function (hillX, hillY, radius, isFront, drawProps) {

    this.isFront = isFront;
    this.drawProps = drawProps;

    this.angle = isFront ? 0 : Math.PI;
    this.length = gameObjectHandler.turret.height;
    this.width = gameObjectHandler.turret.width;
    this.hillX = hillX;
    this.hillY = hillY;
    this.radius = radius + this.length / 2;

    this.calcCoords = function () {
        this.x = this.hillX + this.radius * Math.cos(this.angle);
        this.y = this.hillY + this.radius * Math.sin(this.angle);
    };

    this.newAngle = function (angle) {
        // console.log('new angle');
        this.angle = this.isFront ? angle : angle + Math.PI;
        this.calcCoords();
    };

    this.calcCoords();
};