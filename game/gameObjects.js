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
        this.fireDelay = 1000;
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
        //console.log('dx: ' + dx + ', dy: ' + dy);
        var oldX = this.x, oldY = this.y;
        this.x += dx;
        this.y += dy;
        if (!this.gameWorld.playerCanMoveTo(this)) {
            this.x = oldX;
            this.y = oldY;
        }
        // rotation
        var da = 0;
        var angularSpeedScaled = this.angularSpeed * dt / 1000;
        if (!(l && r)) {
            if (l) da = angularSpeedScaled;
            else if (r) da = -angularSpeedScaled;
        }
        if (da !== 0 && this.isKing) gameWorld.kingRotated(this);
        this.a += da;
        // fire logic
        if (s && this.timeUntilNextFire <= 0) {
            this.gameWorld.fireProjectile(this);
            this.timeUntilNextFire = this.fireDelay;
        }
        else if (this.timeUntilNextFire > 0) this.timeUntilNextFire -= dt;
        if (this.isKing) {
            this.kingTime += dt / 1000;
        }
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
    this.distTrav = 0;
    this.maxDist = maxDist;
    this.finished = false;
    this.drawProps = drawProps;
    this.player = player;

    this.update = function (dt) {
        var dScaled = this.del * dt / 1000.0;
        this.distTrav += dScaled;
        if (this.distTrav >= this.maxDist) {
            this.finished = true;
            return;
        }

        var dx = dScaled * Math.cos(this.a);
        var dy = dScaled * Math.sin(this.a);
        this.x += dx;
        this.y += dy;
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
    this.angle = isFront ? 0 : Math.PI;
    this.length = gameObjectHandler.turret.height;
    this.width = gameObjectHandler.turret.width;
    this.hillX = hillX;
    this.hillY = hillY;
    var offset = radius + this.length / 2;
    if (!isFront) offset = -offset;
    this.x = hillX + offset;
    this.y = hillY;
    this.drawProps = drawProps;
    console.log('front: ' + isFront);
    console.log('x: ' + this.x);
    console.log('y: ' + this.y);
    this.newAngle = function (angle) {
        console.log('new angle');
        this.angle = isFront ? angle : angle + Math.PI;
        var dx = this.x - this.hillX, dy = this.y - this.hillY;
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var dxN = dx * cos - dy * sin;
        var dyN = dy * cos + dx * sin;
        this.x = this.hillX + dxN;
        this.y = this.hillY + dyN;
    };
};