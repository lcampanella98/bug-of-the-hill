const Spider = require('./bugSpider');
const Ant = require('./bugAnt');

module.exports = {
    addToBugPrototype: function (bugTypeName, props) {
        bugTypeName = bugTypeName.toLowerCase();
        let obj = null;
        if (bugTypeName === 'ant') {
            obj = Ant;
        } else if (bugTypeName === 'spider') {
            obj = Spider;
        }
        if (obj === null) return;

        for (let k in props) {
            if (props.hasOwnProperty(k)) obj.prototype[k] = props[k];
        }
    }
};