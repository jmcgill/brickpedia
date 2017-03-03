require.config({
    baseUrl: "/client/js/app",
    // 3rd party script alias names (Easier to type "jquery" than "libs/jquery, etc")
    // probably a good idea to keep version numbers in the file names for updates checking
    paths: {
        // Core Libraries
        "jquery": "/client/libs/jquery/dist/jquery",
        "underscore": "/client/libs/underscore/underscore",
        "backbone": "/client/libs/backbone/backbone",
        "backbone.radio": "/client/libs/backbone.radio/build/backbone.radio",
        "marionette": "/client/libs/backbone.marionette/lib/backbone.marionette",
        "handlebars": "/client/libs/handlebars/handlebars",
        "text": "/client/libs/text/text"
        /*
        "jqueryui": "/static/libs/jqueryui",

        "strftime": "/static/libs/strftime",
        "event_parser": "/static/libs/event_parser",
        "linkify": "/static/libs/linkify",
        "backbone-enter": "/static/libs/plugins/backbone-enter",
        "collectionsubset": "/static/libs/backbone.collectionsubset",
        'typeahead': '/static/libs/typeahead',
        'localstorage': '/static/libs/backbone.localStorage',
        'moment': '/static/libs/moment',
        'sjcl': '/static/libs/sjcl',

        // Plugins
        "backbone.validateAll": "/static/libs/plugins/Backbone.validateAll",
        "bootstrap": "/static/libs/plugins/bootstrap",
        "text": "/static/libs/plugins/text"
        */
    },
    // Sets the configuration for your third party scripts that are not AMD compatible
    shim: {
        //"bootstrap": ["jquery"],
        'typeahead': ["jquery"],
        "backbone": {
            "deps": ["underscore"],
            // Exports the global window.Backbone object
            "exports": "Backbone"
        },
        "marionette": {
            "deps": ["underscore", "backbone", "jquery", "backbone.radio"],
            // Exports the global window.Marionette object
            "exports": "Marionette"
        },
        "handlebars": {
            "exports": "Handlebars"
        },
        /*
        "strftime": {
            "exports": "strftime"
        },
        "linkify": {'
            "exports": "linkify"
        },
        // Backbone.validateAll plugin (https://github.com/gfranko/Backbone.validateAll)
        "backbone.validateAll": ["backbone"],
        "collectionsubset": ["backbone"]
        */
    }
});

// Includes Desktop Specific JavaScript files here (or inside of your Desktop router)
require(["app", "routers/app-router", "controllers/controller", "jquery"/*"bootstrap"*/],
    function (App, AppRouter, Controller) {
        App.appRouter = new AppRouter({
            controller: new Controller()
        });
        Backbone.history.start();
        App.start();
    });
