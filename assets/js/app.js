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

            var parseCells = function(txt) {
                var cells = [];
                txt.replace(/^\s+|\s+$/).split(/\n|\|/).forEach(function(cell) {
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
                return cells;
            };

            var map1 = "\
-3,-2LR | -2,-2LR | -1,-2LR | 0,-2LR | 1,-2L\n\
-3,-1LR | -2,-1LR | -1,-1LR | 0,-1LR | 1,-1LR | 2,-1L\n\
-3,0R | -2,0LR | -1,0LR | 0,0LR | 1,0LR | 2,0LR\n\
-2,1R | -1,1LR | 0,1LR | 1,1LR | 2,1LR\n\
            ";
            var cells = parseCells(map1);
            // var cells = [
            //     [0, 0, 'L'], [0, 0, 'R'], [1, 0, 'L'], [1, 0, 'R'],
            //     [0, 1, 'L'], [0, 1, 'R'], [1, 1, 'L'], [1, 1, 'R']
            // ];
            // var cells = parseCells('0,0LR|0,1LR|1,0LR|1,1LR');

            console.log("CELLS: ");
            console.log(cells);
            var SIDE = 80;
            var HEIGHT = Math.tan(Math.PI / 3) * SIDE / 2;

            var c = function(x, y) {
                return x + ',' + y;
            };

            var YOLO_OFFSET_X = 300;
            var YOLO_OFFSET_Y = 300;

            var x, y;
            var tr;

            cells.forEach(function(cell) {
                y = (cell[1] * HEIGHT) + YOLO_OFFSET_Y;
                x = (cell[0] * SIDE) - (cell[1] * SIDE / 2) + YOLO_OFFSET_X;

                if(cell[2] === 'L') {
                    tr = S.path('M' + c(x, y) + 'L' + c(x + SIDE/2, y + HEIGHT) + 'L' + c(x - SIDE/2, y + HEIGHT) + 'L' + c(x, y));
                    tr.attr({
                        fill : 'none',
                        strokeWidth : 2,
                        stroke : '#000'
                    });
                    // S.text(x + 5, y + 10, [cellIndex / 2 - 1, rowIndex - 1, cellIndex / 2 - rowIndex].join(','));
                    S.text(x + 5, y + 10, [cell[0], cell[1], cell[0] - cell[1]].join(','));
                } else {
                    tr = S.path('M' + c(x, y) + 'L' + c(x + SIDE, y) + 'L' + c(x + SIDE/2, y + HEIGHT) + 'L' + c(x, y));
                    tr.attr({
                        fill : 'none',
                        strokeWidth : 2,
                        stroke : '#000'
                    });

                }
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
                gy = (unit.y * HEIGHT) + YOLO_OFFSET_Y;
                gx = ((unit.x * SIDE) - (unit.y * SIDE / 2)) + YOLO_OFFSET_X;
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
