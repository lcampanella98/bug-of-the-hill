const mathtools = {};

mathtools.getPerpendicularVector = function(x,y) {
    return [y,-x];
};

mathtools.getProjection = function (x1, y1, x2, y2) {
    let scale = (x1 * x2 + y1 * y2) / (x2 * x2 + y2 * y2);
    return [scale * x2, scale * y2];
};

mathtools.isInside = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    const x = point[0], y = point[1];

    let inside = false;
    let xi, yi, xj, yj;
    let intersect;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        xi = vs[i][0];
        yi = vs[i][1];
        xj = vs[j][0];
        yj = vs[j][1];

        intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

mathtools.normSquared = function (v) {
    let norm = 0;
    for (let i = 0; i < v.length; ++i) norm += v[i] * v[i];
    return norm;
};

mathtools.norm = function (v) {
    let norm = 0;
    for (let i = 0; i < v.length; ++i) norm += v[i] * v[i];
    return Math.sqrt(norm);
};

mathtools.unitVector = function (v) {
    let norm = mathtools.norm(v);
    return mathtools.scaleVector(v, 1.0/norm);
};

mathtools.scaleVector = function (v, scale) {
    const v2 = new Array(v.length);
    for (let i = 0; i < v2.length; ++i) v2[i] = v[i] * scale;
    return v2;
};

mathtools.addVectors = function (v1, v2) {
    const v3 = new Array(v1.length);
    for (let i = 0; i < v3.length; ++i) {
        v3[i] = v1[i] + v2[i];
    }
    return v3;
};

mathtools.randInt = function (ceil) {
    return Math.floor(Math.random() * ceil);
};

mathtools.randIntBetween = function (floor, ceil) {
    return Math.floor(Math.random() * (ceil - floor) + floor);
};


module.exports = mathtools;