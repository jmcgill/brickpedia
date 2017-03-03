define(['jquery', 'backbone', 'marionette', 'underscore', 'handlebars', 'views/app-view', 'models/app', 'text!templates/error.html'],
    function ($, Backbone, Marionette, _, Handlebars, AppView, AppState, errorTemplate) {
        console.log(Marionette.Application);
        var App = Marionette.Application.extend({
            initialize: function() {

                this.root = new AppView();
            }
        });

        // App.addInitializer(function (options) {
        //     Backbone.history.start();
        //
        //     $("body").click(function () {
        //         window.location.hash = "";
        //     });
        // });
        //
        // App.state = new AppState({
        //     passphrase: localStorage.getItem('key')
        // });
        // console.log(App.state.get('location'));

        // Handlebar helpers
        // Handlebars.registerHelper('strftime', function (formatter, text) {
        //    return strftime(formatter, text);
        //});

        // Marionette.Region.prototype.open = function(view) {
        //     this.$el.hide();
        //     this.$el.html(view.el);
        //     // this.$el.slideDown("slow");
        //     this.$el.fadeIn("slow");
        // }

        // Generic error handler; this is a fall back to let me know something
        // unhandled has gone wrong.
        // $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
        //     // TODO(jmcgill): Consider converting this to a region and errors to a view.
        //     var template = Handlebars.compile(errorTemplate);
        //     var context = {
        //         error: JSON.stringify(jqxhr.responseText)
        //     };
        //     console.log(template(context));
        //     $("body").prepend(template(context));
        //     $(".big-error").slideDown("slow");
        // });

        var app = new App();

        //app.on('before:start', function () {
        //    app.initialize();
        //});

        return app;
    });
