define(['app', 'jquery', 'marionette', 'handlebars', 'text!templates/event-summary.html'],
    function (App, $, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            template: Handlebars.compile(template),

            initialize: function () {
                this.listenTo(this.model, 'change', this.render);
            },

            ui: {},

            events: {},

            templateHelpers: {
                linked_title: function () {
                    var linked = linkify(this.model.get('title'));
                    var x = $("<div>" + linked + "</div>");

                    x.find("a").each(function (idx, el) {
                        var el = $(el);
                        el.html('link');
                    });

                    return x.html();
                }
            },
        });
    });
