var celebObj = require('../celeb/celeb.json');
var sizeOf = require('image-size');

module.exports = {};

var GameComponent = module.exports.GameComponent = function () {
    // var x, y, a;
    // var fill, fillColor;
    // var stroke, strokeColor, lineWidth;
    // var isCircle, radius;
    // var isRect, w, h;
    // var isObj, id;
    // var isText, font, text;

};

var GameObject = module.exports.GameObject = function (id) {
    // id
    // img file if not celeb
    // celeb with image file
};

module.exports.Celeb = function () {
    // name

};

var celebs = [];
var allGameObjects = [];

if (celebObj.hasOwnProperty('celebs')) {
    celebs = celebObj.celebs;
}
var idCounter = 0;
var turret = new GameObject();
turret.id = idCounter++;
turret.file = 'otherimg/turret_sized.png';
allGameObjects.push(turret);
for (var i = 0;i < celebs.length; i++) {
    var c = new GameObject();
    c.id = idCounter++;
    celebs[i].file = 'celeb/' + celebs[i].file;
    var dims = sizeOf('public/images/' + celebs[i].file);
    celebs[i].id = c.id;
    c.celeb = celebs[i];
    c.celeb.width = dims.width;
    c.celeb.height = dims.height;
    c.file = c.celeb.file;
    c.width = dims.width;
    c.height = dims.height;
    allGameObjects.push(c);
}

module.exports.allGameObjects = allGameObjects;
module.exports.celebs = celebs;
module.exports.turret = turret;