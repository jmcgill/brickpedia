define(['app', 'marionette', 'handlebars', 'text!templates/event-entry.html'],
    function (App, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            template: Handlebars.compile(template),
            collection: null,

            ui: {
                input: "#input"
            },

            events: {
                "keyup #input": "parse",
                "click #input": "click"
            },

            initialize: function () {
                this.listenTo(this.model, 'change', this.update);
            },

            onShow: function () {
                this.ui.input.val(this.model.get('text'));
            },

            update: function () {
                var text = this.model.get('text');
                var currentText = this.ui.input.val();

                if (currentText != text) {
                    this.ui.input.val(text);
                }
            },

            parse: function (e) {
                Parse(this.model, $(e.target).val());

                if (e.keyCode == 13) {
                    this.saveModel();
                }
            },

            click: function (e) {
                return false;
            },

            saveModel: function (e) {
                this.collection.add(this.model);
                this.model.save({}, {
                    success: function (model) {
                        console.log('Saved new model with ID: ', model.get('id'));
                    }
                });

                App.vent.trigger('new_event');
            }
        });
    });
