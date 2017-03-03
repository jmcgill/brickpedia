define(["jquery", "backbone"],
    function ($, Backbone) {
        // Creates a new Backbone Model class object
        var Model = Backbone.Model.extend({
            // Default values for all of the Model attributes
            defaults: {
                'location': 'home',
                'passphrase': null
            }
        });

        return Model;
    }
);
