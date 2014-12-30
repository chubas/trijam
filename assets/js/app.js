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
            var map1 = "\
-4,-4LR | -3,-4LR | -2,-4LR | -1,-4LR | 0,-4L |\
-4,-3LR | -3,-3LR | -2,-3LR | -1,-3LR | 0,-3LR | 1,-3L |\
-4,-2LR | -3,-2LR | -2,-2LR | -1,-2LR | 0,-2LR | 1,-2LR | 2,-2L |\
-4,-1LR | -3,-1LR | -2,-1LR | -1,-1LR | 0,-1LR | 1,-1LR | 2,-1LR | 3,-1L |\
-4,0R   | -3,0LR  | -2,0LR  | -1,0LR  | 0,0LR  | 1,0LR  | 2,0LR  | 3,0LR |\
          -3,1R   | -2,1LR  | -1,1LR  | 0,1LR  | 1,1LR  | 2,1LR  | 3,1LR |\
                    -2,2R   | -1,2LR  | 0,2LR  | 1,2LR  | 2,2LR  | 3,2LR |\
                              -1,3R   | 0,3LR  | 1,3LR  | 2,3LR  | 3,3LR"
            var map = Map.parseMap(map1);
            var cells = map.cells;



            var soldier = new Unit({
                id : 'ARBITRARY_STRING_PLATYPUS',
                faction : 'red',
                hp : 4,
                x : 0,
                y : 0,
                range : [
                    [[-1, -1, 'L'], 1],
                    [[-1, -1, 'R'], 1],
                    [[ 0, -1, 'L'], 1]
                ]
            });

            var marine = new Unit({
                id : 'BAILACOMOJUANALACUBANA',
                faction : 'blue',
                hp : 6,
                x : -2,
                y : -1,
                range : [
                    [[-1, -2, 'L'], 1]
                ]
            });

            var units = [soldier, marine];

            var renderer = new MapRenderer({ map : map, units : units });
            renderer.renderGrid();
            renderer.renderUnits();

            // units.forEach(function(unit) {
            //     drawUnit(unit);
            // });

            $('#test-rot').on('click', function() {
                units.forEach(function(unit) {
                    unit.rotate();
                    renderer.unitSprites[unit.id].remove(); // Refactor: too much information
                    renderer.renderUnit(unit);
                });
            });

            var _coords = [[1, 0], [1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1]];
            var _index = 0;
            $('#test-mov').on('click', function() {
                units.forEach(function(unit) {
                    console.log("Moving ", _coords[_index])
                    unit.move(_coords[_index]);
                    renderer.unitSprites[unit.id].remove();
                    renderer.renderUnit(unit);
                });
                _index = (_index + 1) % _coords.length;
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
