const mathtools = require('../mathtools');
const DrawableComponent = require('../gameConfigHandler').DrawableComponent;

function BugBase (player) {
    this.player = player;
    this.gameWorld = player.gameWorld;

    this.curSpriteIndex = 0;
    this.curSpriteTime = 0;
    this.timePerSprite = 100;

    this.isKing = false;
    this.timeAsKing = 0;

    this.maxHealth = this.JSONConfig.health;
    this.speed = this.JSONConfig.speed;
    this.sprites = this.JSONConfig.sprites;
    this.damage = this.JSONConfig.damage;
    this.bugType = this.JSONConfig.bugType;

    this.health = this.maxHealth;
    this.angularSpeed = 2;

    this.input = player.getDefaultInputObj();
}

BugBase.prototype.isKingBug = function () {
    return this.isKing;
};

BugBase.prototype.crownKing = function () {
    this.isKing = true;
};

BugBase.prototype.dethroneKing = function () {
    this.isKing = false;
};

BugBase.prototype.getCurrentSprite = function () {
    return this.sprites[this.curSpriteIndex];
};

BugBase.prototype.updateSprite = function (dt) {
    this.curSpriteTime += dt;
    if (this.curSpriteTime >= this.timePerSprite) {
        this.curSpriteIndex = (this.curSpriteIndex + 1) % this.sprites.length;
        this.curSpriteTime = 0;
    }
};

BugBase.prototype.update = function (dt) {
    if (this.shouldProcessInputNormally()) {
        this.processInput(dt);
    }
    if (this.shouldUpdateSpriteNormally()) {
        this.updateSprite(dt);
    }
    this.updateBoundingBox();
};

BugBase.prototype.getInputObj = function () {
    return this.input;
};

BugBase.prototype.setInputObj = function (inputObj) {
    this.input = inputObj;
};

BugBase.prototype.shouldProcessInputNormally = function () {
    return this.attack.shouldProcessInputNormally();
};

BugBase.prototype.shouldUpdateSpriteNormally = function () {
    return this.attack.shouldUpdateSpriteNormally();
};

BugBase.prototype.processInput = function (dt) {
    const ip = this.input;
    if (ip === undefined) return;
    const l = ip.l, r = ip.r, u = ip.u, d = ip.d, s = ip.s;

    // forward/back motion
    let dx = 0, dy = 0;
    const vScale = this.speed * dt / 1000.0;
    if (!(u && d) && !this.isKing) {
        if (u) {
            dx = vScale * Math.cos(this.a);
            dy = vScale * Math.sin(this.a);
        } else if (d) {
            dx = - vScale * Math.cos(this.a);
            dy = - vScale * Math.sin(this.a);
        }
    }
    const validDeltas = this.getValidMovement(dx, dy);
    this.x += validDeltas[0];
    this.y += validDeltas[1];

    // rotation
    let da = 0;
    let angularSpeedScaled = this.angularSpeed * dt / 1000;
    if (!(l && r)) {
        if (l) da = angularSpeedScaled;
        else if (r) da = -angularSpeedScaled;
    }
    this.a += da;

    // if (da !== 0 && this.isKing) this.gameWorld.kingRotated(this);

    if (
        ((l || r) && !(l && r))
        || ((u || d) && !(u && d))
    ) this.updateSprite(dt);


    // fire logic
    if (s) {
        this.attack.attack();
    }
    else if (this.timeUntilNextFire > 0) this.timeUntilNextFire -= dt;

};

BugBase.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
};

BugBase.prototype.setAngle = function (a) {
    this.a = a;
};

BugBase.prototype.getValidMovement = function (dx, dy) {
    const newX = this.x + dx, newY = this.y + dy;
    let newDx = dx, newDy = dy;
    // check world bounds
    if (newX < 0 || newX > this.gameWorld.worldWidth) newDx = 0;
    if (newY < 0 || newY > this.gameWorld.worldHeight) newDy = 0;
    // check hill
    // player cannot move inside hill unless it is empty
    if (this.gameWorld.king !== null && this.gameWorld.hill.isInsideHill(this) && this.isMovingTowardHill(newDx, newDy)) {
        let hillTangent = mathtools.getPerpendicularVector(this.x - this.gameWorld.hill.x, this.y - this.gameWorld.hill.y);
        let proj = mathtools.getProjection(newDx, newDy, hillTangent[0], hillTangent[1]);
        newDx = proj[0];
        newDy = proj[1];
    }
    return [newDx, newDy];
};

BugBase.prototype.isMovingTowardHill = function(dx, dy) {
    if (dx === 0 || dy === 0) return false;
    const vHill = [this.gameWorld.hill.x - this.x, this.gameWorld.hill.y - this.y];
    const vPlayer = [dx, dy];
    const dot = vHill[0] * vPlayer[0] + vHill[1] * vPlayer[1];
    const vHillMag = Math.hypot(vHill[0], vHill[1]);
    const vPlayerMag = Math.hypot(vPlayer[0], vPlayer[1]);
    const angle = Math.acos(dot / (vHillMag * vPlayerMag));
    return Math.abs(angle) <= Math.PI / 2;
};

BugBase.prototype.getBoundingBox = function () {
    return this.boundingBox;
};

BugBase.prototype.updateBoundingBox = function () {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    this.boundingBox = [
        [this.x + halfWidth, this.y + halfHeight],
        [this.x - halfWidth, this.y + halfHeight],
        [this.x - halfWidth, this.y - halfHeight],
        [this.x + halfWidth, this.y - halfHeight]
    ];
};

BugBase.prototype.getAttack = function () {
    return this.attack;
};

BugBase.prototype.setAttack = function (attack) {
    this.attack = attack;
};

BugBase.prototype.getHealth = function () {
    return this.health;
};

BugBase.prototype.setHealth = function (health) {
    this.health = health;
    if (this.health <= 0) {
        this.killed();
    }
};

BugBase.prototype.damage = function (damage) {
    this.health -= damage;
    if (this.health <= 0) {
        this.killed();
    }
};

BugBase.prototype.killed = function () {
    // call player killed
    this.player.bugKilled();
};

BugBase.prototype.getBugName = function () {
    return this.bugName;
};

BugBase.prototype.setBugName = function (bugName) {
    this.bugName = bugName;
};

BugBase.prototype.getPlayer = function () {
    return this.player;
};

BugBase.prototype.getDrawableGameComponents = function () {
    const comps = [];

    const sprite = this.getCurrentSprite();
    const bugComp = new DrawableComponent();
    bugComp.x = this.x;
    bugComp.y = this.y;
    bugComp.a = this.a;
    bugComp.isImageObj = true;
    bugComp.id = sprite.id;
    bugComp.w = sprite.width;
    bugComp.h = sprite.height;

    comps.push(bugComp);

    const attackComps = this.attack.getDrawableGameComponents();
    for (let i = 0; i < attackComps.length; ++i) {
        comps.push(attackComps[i]);
    }
    return comps;
};

module.exports = BugBase;
