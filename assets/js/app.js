Class('App').inherits(Widget)({
    prototype : {
        init : function(config){
            Widget.prototype.init.call(this, config);

            this._bindEvents();

            console.log('Send socket req...');
            this.socket.emit('client:hello', {
                message: 'sup!'
            });

            /***/

            var S = Snap(1000, 800);

            var grid = [
                ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
                ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
                ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
                ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
                ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
                ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none', 'none']
            ];

            var SIDE = 80;
            var HEIGHT = Math.tan(Math.PI / 3) * SIDE / 2;

            var c = function(x, y) {
                return x + ',' + y;
            };

            // var COORD = function(x, y, z) {
            //     gridY = (y * HEIGHT);
            //     gridX = ((Math.floor(x / 2) * SIDE) - (y * SIDE / 2)) + YOLO_OFFSET;
            //     if(z % 2 === 0) {
            //         return
            //     } else {

            //     }
            // };

            var YOLO_OFFSET = 200;

            var x, y;
            var tr;
            grid.forEach(function(row, rowIndex) {
                row.forEach(function(cell, cellIndex) {

                    // rowIndex = rowIndex - 2;
                    // cellIndex = cellIndex - 2;

                    y = (rowIndex * HEIGHT);
                    x = ((Math.floor(cellIndex / 2) * SIDE) - (rowIndex * SIDE / 2)) + YOLO_OFFSET;

                    if(cellIndex % 2 === 0) {
                        tr = S.path('M' + c(x, y) + 'L' + c(x + SIDE/2, y + HEIGHT) + 'L' + c(x - SIDE/2, y + HEIGHT) + 'L' + c(x, y));
                        tr.attr({
                            fill : cell,
                            strokeWidth : 2,
                            stroke : '#000'
                        });
                        // S.text(x + 5, y + 10, [cellIndex / 2 - 1, rowIndex - 1, cellIndex / 2 - rowIndex].join(','));
                        S.text(x + 5, y + 10, [cellIndex / 2, rowIndex, cellIndex / 2 - rowIndex].join(','));
                    } else {
                        tr = S.path('M' + c(x, y) + 'L' + c(x + SIDE, y) + 'L' + c(x + SIDE/2, y + HEIGHT) + 'L' + c(x, y));
                        tr.attr({
                            fill : cell,
                            strokeWidth : 2,
                            stroke : '#000'
                        });

                    }
                });
            });

            var soldier = {
                id : 'ARBITRARY_STRING_PLATYPUS',
                faction : 'red',
                hp : 4,
                x : 1,
                y : 1,
                range : [
                    [[-1, -1, 'L'], 1],
                    [[-1, -1, 'R'], 1],
                    [[ 0, -1, 'L'], 1]
                ]
            };

            var marine = {
                id : 'BAILACOMOJUANALACUBANA',
                faction : 'blue',
                hp : 6,
                x : 2,
                y : 3,
                range : [
                    [[-1, -2, 'L'], 1]
                ]
            };

            var units = [soldier, marine];
            var sprites = [];

            var drawUnit = function(unit) {
                var sprite;
                var range, r;
                var nx, ny;
                gy = (unit.y * HEIGHT);
                gx = ((unit.x * SIDE) - (unit.y * SIDE / 2)) + YOLO_OFFSET;
                s = S.circle(gx, gy, 10);
                s.attr({
                    fill : unit.faction,
                    strokeWidth : 1,
                    stroke : '#000'
                });
                rangeGroup = S.g();
                unitGroup = S.g();
                unit.range.forEach(function(range) {
                    ny = gy + (range[0][1] * HEIGHT);
                    nx = gx + (range[0][0] * SIDE) - (SIDE / 2 * range[0][1]);
                    // console.log("G: ", gx, gy);
                    // console.log("H: ", HEIGHT);
                    // console.log("RANGE: ", range.toString());
                    // console.log("N: ", nx, ny);
                    if(range[0][2] === 'L') {
                        r = S.path('M' + c(nx, ny) + 'L' + c(nx + SIDE/2, ny + HEIGHT) + 'L' + c(nx - SIDE/2, ny + HEIGHT) + 'L' + c(nx, ny));
                    } else {
                        r = S.path('M' + c(nx, ny) + 'L' + c(nx + SIDE, ny) + 'L' + c(nx + SIDE/2, ny + HEIGHT) + 'L' + c(nx, ny));
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
                sprites[unit.id] = unitGroup;
                return unitGroup;
            };


            // units.forEach(function(unit) {
            //     unit.range = unit.range.map(function(rangeDef) {
            //         return [rotateOneStep, rangeDef[1]]
            //     });
            //     drawUnit(unit);
            // });

            /***/

            var _rotateUnitStep = function(unit) {
                var newRange = unit.range.map(function(range) {
                    return [rotateOneStep(range[0]), range[1]];
                });
                unit.range = newRange;
            };

            // /* `steps` is a number 0 - 5, indicating the number of rotations clockwise */
            // var rotateUnit = function(unit, steps) {
            //     sprites[unit.id].remove();
            //     steps = steps % 6;
            //     if(steps === 0) {
            //         return; // No movement
            //     }
            //     for(var i = 0; i < steps; steps++) {
            //         _rotateUnitStep(unit);
            //     }
            //     drawUnit(unit);
            // };

            var rotateOneStep = function(coords) {
                var rx, ry, rz, nx, ny, nz, fx, fy, flr;
                rx = coords[0];
                ry = coords[1];
                rz = coords[0] - coords[1];

                nx = rz;
                ny = rx;
                nz = -ry;

                if(coords[2] === 'L') {
                    nx = nx - 1;
                }

                var result = [nx, ny, coords[2] === 'L' ? 'R' : 'L'];
                console.log('^^  ' + coords.join(',') + ' (' + [rx, ry, rx].join(',') + ') ' +
                        '-> ' + result + ' (' + [nx, ny, nz] + ')');
                return result;
            };

            // var t1 = [-1, -1, 'L'];
            // var t2 = [-1, -2, 'L'];
            // // var t1 = [2, 0, 0];
            // // var t2 = [2, 1, 1];

            // console.log("----");

            // console.log(t1.join(','));
            // for(var i = 0; i < 6; i++) {
            //     t1 = rotateOneStep(t1);
            //     // console.log("t1 ", t1.join(','));
            // }

            // console.log("----");

            // console.log(t2.join(','));
            // for(var i = 0; i < 6; i++) {
            //     t2 = rotateOneStep(t2);
            //     // console.log("t2 ", t2.join(','));
            // }

            units.forEach(function(unit) {
                drawUnit(unit);
            });

            $('#test-rot').on('click', function() {
                units.forEach(function(unit) {
                    _rotateUnitStep(unit);
                    sprites[unit.id].remove();
                    drawUnit(unit);
                });
            });

            return;
        },

        _bindEvents : function(){
            this.socket.on('server:echo', this._handleEcho.bind(this));
        },

        _handleEcho : function(data){
            console.log(data.message);
        }
    }
});

$(document).ready(function(){
    var socket = io.connect();
    window.app = new App({
        socket : socket
    });
});
