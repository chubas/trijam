Class('Unit')({

    prototype : {

        position : null, // V
        range    : null, // [R1, R2...]
        faction  : null,

        // id : null,
        // name : null,

        init : function(config) {
            Object.keys(config || {}).forEach(function (propertyName) {
                this[propertyName] = config[propertyName];
            }, this);
        },


        rotate : function() {
            var unit = this;
            var newRange = unit.range.map(function(range) {
                return [unit._rotateCellCoord(range[0]), range[1]];
            });
            unit.range = newRange;
            return this;
        },

        move : function(coords) {
            var unit = this;
            unit.x = unit.x + coords[0];
            unit.y = unit.y + coords[1];
        },

        _rotateCellCoord : function(coords) {
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
        },

    }

});