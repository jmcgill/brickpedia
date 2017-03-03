define(['marionette', 'controllers/controller'], function (Marionette, Controller) {
    return Marionette.AppRouter.extend({
        appRoutes: {
            "": "index",
            "list": "list",
            "event/:id": "select"
        }
    });
});
