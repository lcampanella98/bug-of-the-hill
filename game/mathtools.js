let mathtools = {};

mathtools.getPerpendicularVector = function(x,y) {
    return [y,-x];
};

mathtools.getProjection = function (x1, y1, x2, y2) {
    let scale = (x1 * x2 + y1 * y2) / (x2 * x2 + y2 * y2);
    return [scale * x2, scale * y2];
};

module.exports = mathtools;