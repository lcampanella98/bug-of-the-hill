let bugObj = require('../bug/bugs.json');
let sizeOf = require('image-size');

module.exports = {};

let GameComponent = module.exports.GameComponent = function () {
    this.x = 0;
    this.y = 0;
    this.a = 0;
    this.fill = false;
    this.fillColor = undefined;
    this.stroke = false;
    this.strokeColor = undefined;
    this.lineWidth = undefined;
    this.isCircle = false;
    this.radius = undefined;
    this.isRect = false;
    this.w = undefined;
    this.h = undefined;
    this.isObj = false;
    this.id = undefined;
    this.isText = false;
    this.font = undefined;
    this.text = undefined;
};

let GameObject = module.exports.GameObject = function () {
    // id
    // img file if not bug
    // bug with image file
    this.id = undefined;
    this.file = undefined;
    this.width = undefined;
    this.height = undefined;
};

module.exports.Bug = function () {
    // name

};

let bugs = [];
let allGameObjects = [];

if (bugObj.hasOwnProperty('bugs')) {
    bugs = bugObj.bugs;
}
// id counter
let idCounter = 0;

// turret
let turret = new GameObject();
turret.id = idCounter++;
turret.file = 'otherimg/turret_sized.png';
let turretDims = sizeOf('public/images/' + turret.file);
turret.width = turretDims.width;
turret.height = turretDims.height;
allGameObjects.push(turret);

// background grid
let bgGrid = new GameObject();
bgGrid.id = idCounter++;
bgGrid.file = 'otherimg/grid_256.png';
let bgGridDims = sizeOf('public/images/' + bgGrid.file);
bgGrid.width = bgGridDims.width;
bgGrid.height = bgGridDims.height;
allGameObjects.push(bgGrid);

// bugs
for (let i = 0; i < bugs.length; i++) {
    let objs = bugs[i].sprites.map(function(sprite) {
        let o = {};
        o.file = 'bug/' + sprite;
        let dims = sizeOf('public/images/' + o.file);
        o.width = dims.width;
        o.height = dims.height;
        o.id = idCounter++;
        return o;
    });
    bugs[i].sprites = objs.map(function(o) {
        return {file:o.file,id:o.id};
    });
    for (let j = 0; j < objs.length; j++) {
        allGameObjects.push(objs[j]);
    }
}
let gameObjIdMap = {};
for (let i = 0; i < allGameObjects.length; i++) {
    gameObjIdMap[allGameObjects[i].id] = allGameObjects[i];
}

module.exports.allGameObjects = gameObjIdMap;
module.exports.bugs = bugs;
module.exports.turret = turret;
module.exports.bgGrid = bgGrid;