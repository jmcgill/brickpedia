// An interrupt requiring action from the user. This is used to adjust scheduling.
define(["jquery", "backbone"],
    function ($, Backbone) {
        return Backbone.Model.extend({
            urlRoot: "/interrupts",

            initialize: function () {
            },

            typeEnum: [
                'DID_YOU_FINISH',
                'OVERDUE_EVENT'
            ],

            // Default values for all of the Model attributes
            defaults: {
                'type': 'DID_YOU_FINISH',
                'event_id': null,
                // TODO(jmcgill): Should I inline all event details? Just the title?
                'event_title': ''
            },

            // Gets called automatically by Backbone when the set and/or save methods are called (Add your own logic)
            validate: function (attrs) {
            },

            parse: function (resp) {
                resp.deadline = new Date(resp.deadline);
                return resp;
            }
        });
    }
);
