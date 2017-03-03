define(['app', 'marionette', 'handlebars', 'text!templates/header-view.html'],
    function (App, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            template: Handlebars.compile(template),

            initialize: function () {
                this.listenTo(this.model, 'change', this.render);
            },

            ui: {
                links: "li"
            },

            events: {
                "keyup #input": "parse"
            },

            update: function () {
                console.log('Updating');

                var loc = '#' + this.model.get('location');
                this.ui.links.removeClass('active');
                this.$el.find(loc).addClass('active');
            },

            templateHelpers: {
                clean_deadline: function () {
                    console.log(this.model.get('deadline'));
                    console.log(strftime);
                    return strftime("%B %d", this.model.get('deadline'));
                }
            },

            parse: function (e) {
                Parse(this.model, $(e.target).val());
            }
        });
    });
