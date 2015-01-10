Class('MapRenderer').includes(CustomEventSupport)({

    neutralCell : '#DDD',

    prototype : {

        map : null,
        units : null,

        init : function(config) {
            var renderer = this;

            Object.keys(config || {}).forEach(function (propertyName) {
                this[propertyName] = config[propertyName];
            }, this);

            this.snap = Snap($('#board')[0]);
            this.side = this.side || 60;
            this.height = Math.tan(Math.PI/3) * this.side / 2;

            this.unitSprites = {};

            // Used for repositioning the whole board (0,0 coord)
            this.offsetX = 300;
            this.offsetY = 240;
            // this.cellSprites = {};

            /********* Debug markers **************/
            // var marker = this.snap.circle(0, 0, 20).attr({
            //     fill : '#00FFFF'
            // });
            // var locMarker = this.snap.circle(0, 0, 8).attr({
            //     fill : '#00F'
            // });

            // this.snap.mousemove(function(event, x, y) {
            //     var gridCoords = renderer.gridCoordsFor(x ,y);
            //     var pixelCoords = renderer.pixelCoordsFor(gridCoords[0], gridCoords[1]);
            //     // console.log(x, y, gridCoords);
            //     marker.attr({
            //         cx : pixelCoords[0],
            //         cy : pixelCoords[1]
            //     });
            //     locMarker.attr({
            //         cx : x,
            //         cy : y
            //     });
            // });
            /***************************************/
        },

        /* Given vertice V(x, y), return the pixel coordinates on screen */
        pixelCoordsFor : function(x, y) {
            var renderer = this;
            var pixelY = (y * renderer.height) + renderer.offsetY;
            var pixelX = (x * renderer.side) - (y * renderer.side / 2) + renderer.offsetX;
            return [pixelX, pixelY];
        },

        /* Returns the closest grid coords V(gx,gy) for pixel coords x,y */
        gridCoordsFor : function(x, y) {
            var renderer = this;
            var gridY = Math.round((y - renderer.offsetY) / renderer.height);
            // console.log("--> (", y, " - ", renderer.offsetY, ") / ", renderer.height, ") = ", ((y - renderer.offsetY) / renderer.height), "--> ", gridY)
            var gridX = Math.round((x - renderer.offsetX + (gridY * renderer.side / 2)) / renderer.side);
            return [gridX, gridY];
        },

        renderGrid : function() {
            var renderer = this;

            var c = function(x, y) {
                return x + ',' + y;
            };

            var x, y;
            var tr;

            var V = function(x, y) {
                return [x, y].join('_');
            }
            var controlVertices = {};

            var createUnitsControl = new CreateUnitsControl();
            var onControlMouseLeave = function() {
                console.log("On control mouse leave!!");
                createUnitsControl.deactivate();
            };

            createUnitsControl.bind('unit:create', function(event) {
                var unit;
                switch(event.data.unit) {
                    case '1':
                        unit = new Unit({
                            id : 'xxx',
                            faction : 'blue',
                            hp : 1,
                            x : event.data.vertex[0],
                            y : event.data.vertex[1],
                            range : [
                                [[-1, -1, 'R'], 1]
                            ]
                        });
                        break;
                    case '2':
                        unit = new Unit({
                            id : 'xxx',
                            faction : 'blue',
                            hp : 1,
                            x : event.data.vertex[0],
                            y : event.data.vertex[1],
                            range : [
                                [[-1, -1, 'L'], 1],
                                [[-1, -1, 'R'], 1],
                                [[0, -1, 'L'], 1]
                            ]
                        });
                        break;
                    case '3':
                        unit = new Unit({
                            id : 'xxx',
                            faction : 'blue',
                            hp : 1,
                            x : event.data.vertex[0],
                            y : event.data.vertex[1],
                            range : [
                                [[-1, -1, 'R'], 1],
                                [[-1, -2, 'L'], 1]
                            ]
                        });
                        break;
                    case '4':
                        unit = new Unit({
                            id : 'xxx',
                            faction : 'blue',
                            hp : 1,
                            x : event.data.vertex[0],
                            y : event.data.vertex[1],
                            range : [
                                [[-1, -1, 'L'], 1],
                                [[0, -1, 'L'], 1],
                                [[0, 0, 'L'], 1]
                            ]
                        });
                        break;
                    default :
                        throw new Error('Unrecognized unit');

                }
                renderer.renderUnit(unit);
                createUnitsControl.deactivate();
            });

            this.map.cells.forEach(function(cell) {

                var pixelCoords = renderer.pixelCoordsFor(cell[0], cell[1]);
                x = pixelCoords[0];
                y = pixelCoords[1];

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

            // Since there are no layers, render them after to be on top
            this.map.cells.forEach(function(cell) {
                var touchingVertices;
                if(cell[2] === 'L') {
                    // the triangle T(x,y)L touches the vertexes V(x, y), V(x, y+1) and V(x+1, y+1)
                    touchingVertices = [[0, 0], [0, 1], [1, 1]];
                } else {
                    // the triangle T(x,y)R touches the vertexes V(x, y), V(x+1, y) and V(x+1, y+1)
                    touchingVertices = [[0, 0], [1, 0], [1, 1]];
                }

                var pixelCoords = renderer.pixelCoordsFor(cell[0], cell[1]);
                x = pixelCoords[0];
                y = pixelCoords[1];

                touchingVertices.forEach(function(deltas) {
                    vertice = V(cell[0] + deltas[0], cell[1] + deltas[1]);
                    if(!controlVertices[vertice]) {
                        var verticeCoords = renderer.pixelCoordsFor(
                            cell[0] + deltas[0],
                            cell[1] + deltas[1]
                        );
                        controlVertices[vertice] = renderer.snap.circle(
                            verticeCoords[0],
                            verticeCoords[1],
                            16
                        ).attr({
                            fill : '#293',
                            opacity : 0.7
                        }).hover(function(event, x, y) {
                            createUnitsControl.currentVertex = [
                                cell[0] + deltas[0],
                                cell[1] + deltas[1]
                            ]
                            createUnitsControl.activateAt(
                                Math.round(verticeCoords[0]),
                                Math.round(verticeCoords[1])
                            );
                        }, function(event, x, y) {
                            if(event.relatedTarget === createUnitsControl.element[0]) {
                                // console.log("Over control!");
                                createUnitsControl.element.unbind('mouseleave').bind('mouseleave', onControlMouseLeave);
                            } else {
                                // console.log("Deactivating!", arguments);
                                createUnitsControl.deactivate();
                            }
                        });
                    }
                });
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
            var gx, gy;
            var unitGroup;
            var c = function(x, y) {
                return x + ',' + y;
            };
            gy = (unit.y * renderer.height) + renderer.offsetY;
            gx = ((unit.x * renderer.side) - (unit.y * renderer.side / 2)) + renderer.offsetX;
            console.log("Unit at ", unit.x, unit.y, " : ", gx, gy);
            // The circle piece that goes in each occupied vertex
            var unitBody = renderer.snap.circle(gx, gy, 16);
            unitBody.attr({
                fill : unit.faction,
                strokeWidth : 1,
                stroke : '#000'
            });
            rangeGroup = renderer.snap.g();
            unitGroup = renderer.snap.g();
            unit.range.forEach(function(range) {

                var r;

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

                if(typeof(debugline) === "undefined") {
                    debugLine = renderer.snap.path('M0,0L0,0').attr({
                        stroke : '#FF0000',
                        strokeWidth : 5
                    });
                }
                r.drag(function(dx, dy, x, y) {
                    var pixelCoords = renderer.pixelCoordsFor(unit.x, unit.y);
                    var direction = renderer.calculateDirection(
                        { x : pixelCoords[0], y : pixelCoords[1] }, // origin
                        { x : x, y : y }
                    );
                    var debugPath = 'M' + c(x, y) + 'L' + c.apply(renderer, renderer.pixelCoordsFor(unit.x, unit.y));
                    debugLine.attr({ path : debugPath });
                    debugLine.attr({
                        opacity : 1
                    });

                    // ROTATE By the difference of positions

                    // console.log("-> ", debugPath);
                }, function() {
                    // On start
                    r.attr({ opacity : 0.75 });
                }, function() {
                    // On end
                    r.attr({ opacity : 0.5 });
                    debugLine.attr({
                        opacity : 0
                    });
                });

                // console.log('ADD', r);
                rangeGroup.add(r);
            });
            // console.log("RANGEGROUP: ", rangeGroup);
            unitGroup.add(rangeGroup);
            unitGroup.add(unitBody);


            unitBody.drag(function(dx, dy, x, y) {
                var gridCoords = renderer.gridCoordsFor(x, y);
                var pixelCoords = renderer.pixelCoordsFor(gridCoords[0], gridCoords[1]);
                // console.log("On move: ", x, y, gridCoords, 'from: ', pixelCoords);
                // gx, gy
                // unitGroup.attr({
                //     x : gridCoords[0],
                //     y : gridCoords[1]
                // });
                unitGroup.transform('T' + (pixelCoords[0] - gx) + ',' + (pixelCoords[1] - gy))
                unit.x = gridCoords[0];
                unit.y = gridCoords[1];

            }, function() {
                // On start
            }, function() {
                // On end
            });
            renderer.unitSprites[unit.id] = unitGroup;
            return unitGroup;
        },

        // To be consistent with Ruby's API, pass two objects with the 'x' and
        // 'y' coordinates as keys from the origin and destination params
        calculateDirection : function(origin, destination) {
            var x = destination.x - origin.x;
            var y = destination.y - origin.y;
            // console.log("x: ", x, " y: ", y);
            var q = Math.PI / 3;
            var angle = Math.atan2(y, x) % (2 * Math.PI); // Extract module so the number is always between 0 and q
            // Fortunately, we have an ECMA Standard that is implementation-dependant-ly enforced!
            // http://www.ecma-international.org/ecma-262/5.1/#sec-15.8.2.5
            // D:<
            if(angle < 0) {
                angle = angle + (2 * Math.PI);
            }

            // console.log("ANGLE: ", angle);
            var direction = Math.floor(angle / q);

            // console.log("Result DIRECTION", direction);
            return direction;
        },

    }

});