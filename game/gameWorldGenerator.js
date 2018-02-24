const gameObjects = require('./gameWorldObjects');
const drawProperties = require('./globalDrawProperties');

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
    this.boundaryRects = this.genBoundryRects();
}

// call this to get data object
GameWorldGenerator.prototype.getDataObject = function () {
    this.components = [];
    this.addAllComponents(this.backgroundComponents);
    this.addAllComponents(this.boundaryRects);
    this.addAllComponents(this.gameWorld.turretFront.getDrawableGameComponents());
    this.addAllComponents(this.gameWorld.turretRear.getDrawableGameComponents());

    this.addAllComponents(this.gameWorld.hill.getDrawableGameComponents());

    for (let i = 0; i < this.gameWorld.players.length; i++) {
        this.addAllComponents(this.gameWorld.players[i].getDrawableGameComponents());
    }
    for (let i = 0; i < this.gameWorld.projectileList.length; i++) {
        this.addAllComponents(this.gameWorld.projectileList[i].getDrawableGameComponents());
    }

    return this.components;
};

GameWorldGenerator.prototype.addAllComponents = function (comps) {
    for (let i = 0; i < comps.length; ++i) {
        this.components.push(comps[i]);
    }
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