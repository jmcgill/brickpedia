// An event to schedule.
define(["jquery", "backbone"],
    function ($, Backbone) {
        var Event = Backbone.Model.extend({
            urlRoot: "/events",

            initialize: function () {

            },

            // Default values for all of the Model attributes
            defaults: {
                'duration_minutes': 30,
                'repeats': false,
                'repeat_duration': 0,
                'repeat_units': 'weeks',
                'title': '',
                'deadline': null,
                'startdate': null,
                'scheduled_start': null,
                'queue': 'work',
                'text': '',
                'scheduled': null
            },

            // Gets called automatically by Backbone when the set and/or save methods are called (Add your own logic)
            validate: function (attrs) {
            },

            parse: function (resp) {
                if (resp.deadline) {
                    resp.deadline = new Date(resp.deadline);
                }

                if (resp.scheduled) {
                    resp.scheduled = new Date(resp.scheduled);
                }

                try {
                    var key = localStorage.getItem("key");
                    //resp.text = sjcl.decrypt(key, JSON.parse(resp.text));
                    //resp.title = sjcl.decrypt(key, JSON.parse(resp.title));
                } catch (err) {
                }

                return resp;
            },

            // save: function (arg, options) {
            //     var code = localStorage.getItem("key");
            //     var attr = this.attributes;

            //     attr.text = JSON.stringify(sjcl.encrypt(code, attr.text));
            //     attr.title = JSON.stringify(sjcl.encrypt(code, attr.title));
            //     options.data = JSON.stringify(attr);
            //     options.contentType = "application/json";

            //     return Backbone.Model.prototype.save.call(this, arg, options);
            // }
        });

        return Event;
    }
);
