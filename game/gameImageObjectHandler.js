const bugObj = require('../bug/bugs.json');
const sizeOf = require('image-size');
const bugPrototypeFactory = require('./bugs/bugPrototypeFactory');

module.exports = {};

module.exports.DrawableComponent = function () {
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
    this.isImageObj = false;
    this.id = undefined;
    this.w = undefined;
    this.h = undefined;

    this.isText = false;
    this.font = undefined;
    this.text = undefined;
};

module.exports.GameImageObject = function () {
    // id
    // img file if not bug
    // bug with image file
    this.id = undefined;
    this.file = undefined;
    this.width = undefined;
    this.height = undefined;

    this.appendToDrawableGameComponent = function (drawComp) {
        drawComp.isImageObj = true;
        drawComp.id = this.id;
        drawComp.w = this.width;
        drawComp.h = this.height;
    };
};

function imgPathToFullPath(imgPath) {
    return 'public/images/' + imgPath;
}

const arrBugsJSONConfig = bugObj.bugs;
const allGameImageObjects = [];

// id counter
let idCounter = 0;

// turretImageObj
const turret = new GameImageObject();
turret.id = idCounter++;
turret.file = 'otherimg/turret_sized.png';
const turretDims = sizeOf(imgPathToFullPath(turret.file));
turret.width = turretDims.width;
turret.height = turretDims.height;
allGameImageObjects.push(turret);

// background grid
let bgGrid = new GameImageObject();
bgGrid.id = idCounter++;
bgGrid.file = 'otherimg/grid_256_green.png';
let bgGridDims = sizeOf(imgPathToFullPath(bgGrid.file));
bgGrid.width = bgGridDims.width;
bgGrid.height = bgGridDims.height;
allGameImageObjects.push(bgGrid);

// bugs
for (let i = 0; i < arrBugsJSONConfig.length; ++i) {
    // add image objects
    let bugSprites = arrBugsJSONConfig[i]['sprites'].map(function(sprite) {
        const o = {};
        o.file = 'bug/' + sprite;
        const dims = sizeOf(imgPathToFullPath(o.file));
        o.width = dims.width;
        o.height = dims.height;
        o.id = idCounter++;
        return o;
    });

    // add json config to bug prototype
    const bugConfig = {};

    const bugPrototypeObj = {
        JSONConfig: {
            speed: arrBugsJSONConfig[i]['speed'],
            health: arrBugsJSONConfig[i]['health'],
            bugType: arrBugsJSONConfig[i]['type'],
            sprites: bugSprites
        }
    };
    bugPrototypeFactory.addToBugPrototype(arrBugsJSONConfig[i]['type'], bugPrototypeObj);

    for (let j = 0; j < bugSprites.length; j++) {
        allGameImageObjects.push(bugSprites[j]);
    }
}
let gameObjIdMap = {};
for (let i = 0; i < allGameImageObjects.length; i++) {
    gameObjIdMap[allGameImageObjects[i].id] = allGameImageObjects[i];
}

module.exports.allGameObjectsById = gameObjIdMap;
module.exports.turretImageObj = turret;
module.exports.bgGridImageObj = bgGrid;