define(["jquery", "backbone", "models/event"],
    function ($, Backbone, Event) {
        return Backbone.Collection.extend({
            model: Event,
            url: "/events"
        });
    });
