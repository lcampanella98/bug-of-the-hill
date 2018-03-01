const Spider = require('./bugSpider');
const Ant = require('./bugAnt');
const Bee = require('./bugBee');

module.exports = {
    addToBugPrototype: function (bugTypeName, props) {
        bugTypeName = bugTypeName.toLowerCase();
        let obj = null;
        if (bugTypeName === 'ant') {
            obj = Ant;
        } else if (bugTypeName === 'spider') {
            obj = Spider;
        } else if (bugTypeName === 'bee') {
            obj = Bee;
        }
        if (obj === null) return;

        for (let k in props) {
            if (props.hasOwnProperty(k)) obj.prototype[k] = props[k];
        }
    },
    hasPrototype: function (bugTypeName) {
        bugTypeName = bugTypeName.toLowerCase();
        return bugTypeName === 'ant'
            || bugTypeName === 'spider'
            || bugTypeName === 'bee';
    }
};