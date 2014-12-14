/*
 * Map is a representation of the cells that compose the terrain.
 */
Class('Map')({

    parseMap : function(mapString) {
        var cells = [];
        mapString.replace(/^\s+|\s+$/).split(/\n|\|/).forEach(function(cell) {
            var match = cell.match(/(-?\d+),(-?\d+)(L?)(R?)/);
            if(!match) {
                throw("Bad cell: " + cell);
            }
            if(match[3]) { // L
                cells.push([parseInt(match[1], 10), parseInt(match[2], 10), 'L']);
            }
            if(match[4]) { // R
                cells.push([parseInt(match[1], 10), parseInt(match[2], 10), 'R']);
            }
        });
        console.log(cells);

        return new Map({ cells : cells });
    },

    prototype : {

        // Array of coordinates [x, y, LR] that form the map grid
        cells : null,

        init : function(config) {
            Object.keys(config || {}).forEach(function (propertyName) {
                this[propertyName] = config[propertyName];
            }, this);
        }
    }

});