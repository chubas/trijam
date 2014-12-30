Class('MapRenderer')({

    neutralCell : '#DDD',

    prototype : {

        map : null,
        units : null,

        init : function(config) {
            Object.keys(config || {}).forEach(function (propertyName) {
                this[propertyName] = config[propertyName];
            }, this);

            this.snap = Snap(1000, 800);
            this.side = this.side || 60;
            this.height = Math.tan(Math.PI/3) * this.side / 2;

            this.unitSprites = {};

            // Used for repositioning the whole board (0,0 coord)
            this.offsetX = 300;
            this.offsetY = 240;
            // this.cellSprites = {};
        },

        renderGrid : function() {
            var renderer = this;

            var c = function(x, y) {
                return x + ',' + y;
            };

            var x, y;
            var tr;

            this.map.cells.forEach(function(cell) {
                y = (cell[1] * renderer.height) + renderer.offsetY;
                x = (cell[0] * renderer.side) - (cell[1] * renderer.side / 2) + renderer.offsetX;

                if(cell[2] === 'L') {
                    tr = renderer.snap.path('M' + c(x, y) + 'L' + c(x + renderer.side/2, y + renderer.height) + 'L' + c(x - renderer.side/2, y + renderer.height) + 'L' + c(x, y));
                    tr.attr({
                        fill : MapRenderer.neutralCell,
                        strokeWidth : 2,
                        stroke : '#000',
                        fillOpacity : 0.5
                    });
                    // S.text(x + 5, y + 10, [cellIndex / 2 - 1, rowIndex - 1, cellIndex / 2 - rowIndex].join(','));
                    renderer.snap.text(x + 5, y + 10, [cell[0], cell[1], cell[0] - cell[1]].join(','));
                } else {
                    tr = renderer.snap.path('M' + c(x, y) + 'L' + c(x + renderer.side, y) + 'L' + c(x + renderer.side/2, y + renderer.height) + 'L' + c(x, y));
                    tr.attr({
                        fill : MapRenderer.neutralCell,
                        strokeWidth : 2,
                        stroke : '#000',
                        fillOpacity : 0.5
                    });
                }
            });


        },

        // This could be moved eventually to a different renderer
        renderUnits : function() {
            var renderer = this;
            this.units.forEach(function(unit) {
                renderer.renderUnit(unit);
            });
        },

        renderUnit : function(unit) {
            var renderer = this;
            var sprite;
            var range, r;
            var nx, ny;
            var c = function(x, y) {
                return x + ',' + y;
            };
            gy = (unit.y * renderer.height) + renderer.offsetY;
            gx = ((unit.x * renderer.side) - (unit.y * renderer.side / 2)) + renderer.offsetX;
            s = renderer.snap.circle(gx, gy, 10);
            s.attr({
                fill : unit.faction,
                strokeWidth : 1,
                stroke : '#000'
            });
            rangeGroup = renderer.snap.g();
            unitGroup = renderer.snap.g();
            unit.range.forEach(function(range) {
                ny = gy + (range[0][1] * renderer.height);
                nx = gx + (range[0][0] * renderer.side) - (renderer.side / 2 * range[0][1]);
                // console.log("G: ", gx, gy);
                // console.log("H: ", renderer.height);
                // console.log("RANGE: ", range.toString());
                // console.log("N: ", nx, ny);
                if(range[0][2] === 'L') {
                    r = renderer.snap.path('M' + c(nx, ny) + 'L' + c(nx + renderer.side/2, ny + renderer.height) + 'L' + c(nx - renderer.side/2, ny + renderer.height) + 'L' + c(nx, ny));
                } else {
                    r = renderer.snap.path('M' + c(nx, ny) + 'L' + c(nx + renderer.side, ny) + 'L' + c(nx + renderer.side/2, ny + renderer.height) + 'L' + c(nx, ny));
                }
                // console.log("UNIT FACTION", unit.faction);
                r.attr({
                    fill : unit.faction,
                    strokeWidth : 1,
                    stroke : '#000',
                    opacity: 0.5
                });
                // console.log('ADD', r);
                rangeGroup.add(r);
            });
            // console.log("RANGEGROUP: ", rangeGroup);
            unitGroup.add(s);
            unitGroup.add(rangeGroup);
            unitGroup.drag();
            renderer.unitSprites[unit.id] = unitGroup;
            return unitGroup;
        }


    }

});