// TODO: We don't need all Widget, yet
Class('CreateUnitsControl').includes(CustomEventSupport)({
    prototype : {

        // Needs to be associated with a vertex
        currentVertex : null,

        init : function(config) {
            var control = this;
            Object.keys(config || {}).forEach(function (propertyName) {
                this[propertyName] = config[propertyName];
            }, this);

            this.element = $('<div class="create-units-control"></div>');
            var unitNames = ['1', '2', '3', '4'];

            unitNames.forEach(function(unitName) {
                var unitThumb = $('<img class="unit-thumb">').attr(
                    'src', '/assets/img/proto-' + unitName + '.png'
                );
                unitThumb.on('click', function() {
                    control.createUnit(unitName);
                });
                control.element.append(unitThumb);
            });
            this.element.appendTo($('body'));
        },

        createUnit : function(unitName) {
            console.log(unitName, 'has been created on', this.currentVertex, '!!')
            this.dispatch('unit:create', {
                data : {
                    vertex : this.currentVertex,
                    unit : unitName
                }
            });
        },

        activateAt : function(x, y) {
            // return;
            this.element.css({
                display : 'block',
                top : y,
                left : x
            });
        },

        deactivate : function() {
            this.element.css({ display : 'none' });
        }

    }
});