define(['app', 'marionette', 'handlebars', 'text!templates/login-view.html'],
    function (App, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            template: Handlebars.compile(template),

            ui: {
                passphrase: "#passphrase"
            },

            events: {
                "click #unlock": "unlock"
            },

            initialize: function () {
                this.listenTo(this.model, 'change', this.render);
            },

            unlock: function (authResult) {
                localStorage.setItem("key", this.ui.passphrase.val());
                this.model.set('passphrase', this.ui.passphrase.val());
            }
        });
    });
