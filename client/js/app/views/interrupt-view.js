define(['app', 'marionette', 'handlebars', 'text!templates/interrupt.html'],
    function (App, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            template: Handlebars.compile(template),

            initialize: function () {
                this.listenTo(this.model, 'change', this.render);
            },

            events: {
                "click #notice-yes": "onClickYes",
                "click #notice-no": "onClickNo",
            },

            ui: {
                container: "#event-container"
            },

            onClickYes: function () {
                // this.model.set('response', 'yes');
                this.model.destroy();
            },

            onClickNo: function () {
                console.log('no');
                // this.model.set('response', 'no');
                this.model.set('scheduled', null);
                this.model.save();
            },

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
