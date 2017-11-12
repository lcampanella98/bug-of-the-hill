var o = module.exports = {};

o.Player = function (name, ws) {
    this.name = name;
    this.ws = ws;
    this.kingTime = 0;
    this.gameWorld = null;

    this.init = function (x, y, angle, celebProps) {
        this.x = x;
        this.y = y;
        this.a = angle;
        this.celebProps = celebProps;
        this.width = 40; // change to celeb image properties
        this.height = 60; // change to celeb image properties
        this.isKing = false;
        this.speed = 2.5; // what does this mean?
        this.netWorth = 100; // change to celeb net worth
        this.input = {"l":false,"r":false,"u":false,"d":false,"s":false};
        this.timeUntilNextFire = 0;
        this.fireDelay = 1000; // fire delay in ms
    };

    this.update = function (dt) {
        var ip = this.input;
        var l = ip.l, r = ip.r, u = ip.u, d = ip.d, s = ip.s;
        // forward/back motion
        var dx = 0, dy = 0;
        if (!(u && d) && !this.isKing) {
            if (u) {
                dx = this.speed * Math.cos(this.a);
                dy = this.speed * Math.sin(this.a);
            } else if (d) {
                dx = - this.speed * Math.cos(this.a);
                dy = - this.speed * Math.sin(this.a);
            }
        }
        var oldX = this.x, oldY = this.y;
        this.x += dx;
        this.y += dy;
        if (!this.gameWorld.playerCanMoveTo(player)) {
            this.x = oldX;
            this.y = oldY;
        }
        // rotation
        var da = 0;
        if (!(l && r)) {
            if (l) da = 0.1; // change this value
            else if (r) da = -0.1; // change this value
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
            [this.x + hWidth, this.y - hHeight],
            [this.x - hWidth, this.y - hHeight]
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

    this.update = function () {
        this.distTrav += this.del;
        if (this.distTrav >= this.maxDist) {
            this.finished = true;
            return;
        }
        var dx = this.del  * Math.cos(a);
        var dy = this.del * Math.sin(a);
        this.x += dx;
        this.y += dy;
    }
};

o.Hill = function (x, y, newKingWithinRadius, playerWithinHillRadius) {
    this.x = x;
    this.y = y;
    this.newKingWithinRadius = newKingWithinRadius;
    this.playerWithinHillRadius = playerWithinHillRadius;
    // this.drawProps = drawProps;

    this.moveOutsideHill = function (player) {
        var dx = player.x - this.x, dy = player.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= this.playerWithinHillRadius) return;
        player.x = this.x + dx * this.playerWithinHillRadius / dist;
        player.y = this.y + dy * this.playerWithinHillRadius / dist;
    };

    this.isInsideHill = function (player) {
        var dx = player.x - this.x, dy = player.y - this.y;
        return dx * dx + dy * dy < this.playerWithinHillRadius * this.playerWithinHillRadius;
    }

};

o.Turret = function (hillX, hillY, radius, isFront, drawProps) {
    this.angle = 0;
    this.length = 60; // change!
    this.width = 20; // change!
    this.hillX = hillX;
    this.hillY = hillY;
    this.x = hillX + (isFront ? (radius + this.length/ 2) : -(radius + this.length / 2));
    this.y = hillY;
    this.newAngle = function (angle) {
        this.angle = isFront ? angle : angle + Math.PI;
        var dx = this.x - this.hillX, dy = this.y - this.hillY;
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var dxN = dx * cos - dy * sin;
        var dyN = dy * cos + dx * sin;
        this.x = this.hillX + dxN;
        this.y = this.hillY + dyN;
    };
};