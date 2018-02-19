const gameObjects = require('./gameWorldObjects');
const Player = gameObjects.Player;
const Projectile = gameObjects.Projectile;
const Turret = gameObjects.Turret;
const Hill = gameObjects.Hill;

const gameObjectHandler = require('./gameConfigHandler');
const DrawableComponent = gameObjectHandler.DrawableComponent;

function GameWorldGenerator (gameWorld) {
    this.gameWorld = gameWorld;
    this.worldWidth = gameWorld.worldWidth;
    this.worldHeight = gameWorld.worldHeight;

    this.backgroundComponents = this.genBackgroundComponents();
    this.font = "20px sans-serif";
    this.boundaryRects = this.genBoundryRects();
}

// call this to get data object
GameWorldGenerator.prototype.getDataObject = function () {
    let obj = {};
    obj.components = [];
    for (let i = 0; i < this.backgroundComponents.length; i++) {
        obj.components.push(this.backgroundComponents[i]);
    }
    for (let i = 0; i < this.boundaryRects.length; i++) {
        obj.components.push(this.boundaryRects[i]);
    }
    obj.components.push(this.genTurretComponent(this.gameWorld.turretFront));
    obj.components.push(this.genTurretComponent(this.gameWorld.turretRear));
    obj.components.push(this.genHillComponent(this.gameWorld.hill));
    for (let i = 0; i < this.gameWorld.playersList.length; i++) {
        let p = this.gameWorld.playersList[i];
        obj.components.push(this.genPlayerComponent(p));
    }
    for (let i = 0; i < this.gameWorld.projectileList.length; i++) {
        obj.components.push(this.genProjectileComponent(this.gameWorld.projectileList[i]));
    }
    let king = this.gameWorld.king;
    obj.kingData = king === null ? null : {
        name: king.name,
        bugName: king.bug.name,
        health: king.health,
        maxHealth: king.maxHealth,
        timeAsKing: king.timeAsKing
    };
    let topKing;
    let topTime;
    for (let i = 0; i < this.gameWorld.playersList.length; i++) {
        let p = this.gameWorld.playersList[i];
        if (p.timeAsKing > 0 && (topTime === undefined || p.timeAsKing > topTime)) {
            topKing = p;
            topTime = p.timeAsKing;
        }
    }
    obj.topKing = topKing === undefined ? null : {
        name: topKing.name,
        health: topKing.health,
        maxHealth: topKing.maxHealth,
        timeAsKing: topKing.timeAsKing,
        bugName: topKing.bug.name
    };
    obj.gameTimeLeft = this.gameWorld.timeLeft;

    return obj;
};

GameWorldGenerator.prototype.genBoundryRects = function () {
    let x, y, w, h, offset = 10;
    const comps = [];
    let comp;
    for (let i = 0; i < 4; i++) {
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
        comp = new DrawableComponent();
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

GameWorldGenerator.prototype.genBackgroundComponents = function () {
    let xMax = this.worldWidth + 3000, yMax = this.worldHeight + 3000;
    let grid = gameObjectHandler.bgGridImageObj;
    let comps = [];
    let comp;
    for (let x = this.worldWidth / 2 - xMax / 2; x <= this.worldWidth / 2 + xMax / 2; x += grid.width) {
        for (let y = this.worldHeight / 2 - yMax / 2; y <= this.worldHeight / 2 + yMax / 2; y += grid.height) {
            comp = new DrawableComponent();
            comp.id = grid.id;
            comp.x = x;
            comp.y = y;
            comp.a = 0;
            comp.isImageObj = true;
            comps.push(comp);
        }
    }
    return comps;
};

GameWorldGenerator.prototype.genPlayerComponent = function (player) {
    const comp = new DrawableComponent();
    comp.x = player.x;
    comp.y = player.y;
    comp.a = player.a;
    comp.isImageObj = true;
    comp.id = player.getCurrentSprite().id;
    comp.playerName = player.name;
    comp.health = player.health;
    comp.maxHealth = player.maxHealth;
    comp.font = this.font;
    return comp;
};

GameWorldGenerator.prototype.genTurretComponent = function (turret) {
    const comp = new DrawableComponent();
    comp.x = turret.x;
    comp.y = turret.y;
    comp.a = turret.angle;
    comp.isImageObj = true;
    comp.id = gameObjectHandler.turretImageObj.id;
    return comp;
};

GameWorldGenerator.prototype.genProjectileComponent = function (proj) {
    const comp = new DrawableComponent();
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

GameWorldGenerator.prototype.genHillComponent = function (hill) {
    const comp = new DrawableComponent();
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

GameWorldGenerator.prototype.genTextComponent = function (x, y, font, text, color) {
    const comp = new DrawableComponent();
    comp.x = x;
    comp.y = y;
    comp.font = font;
    comp.isText = true;
    comp.text = text;
    comp.fillColor = color;
    return comp;
};

module.exports = GameWorldGenerator;