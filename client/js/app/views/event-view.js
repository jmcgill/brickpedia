define(['app', 'jquery', 'marionette', 'handlebars', 'text!templates/event.html'],
    function (App, $, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            template: Handlebars.compile(template),

            initialize: function () {
                this.listenTo(this.model, 'change', this.render);
            },

            ui: {
                container: "#event-container"
            },

            events: {
                "click #close-button": "deleteSelf",
                "click #event-container": "select"
            },

            deleteSelf: function () {
                this.model.destroy();
                return false;
            },

            select: function () {
                this.model.set('duration_minutes', 10);

                //window.location.hash = "event/" + this.model.cid;
                return false;
            }
        });
    });
