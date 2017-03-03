define(["jquery", "backbone", "models/interrupt"],
    function ($, Backbone, Interrupt) {
        return Backbone.Collection.extend({
            model: Interrupt,
            url: "/interrupts"
        });
    });
