Class('MapRenderer')({

    prototype : {

        map : null,

        init : function(config) {
            Object.keys(config || {}).forEach(function (propertyName) {
                this[propertyName] = config[propertyName];
            }, this);
        }

    }

});