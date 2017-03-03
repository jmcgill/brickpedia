// Defines the Layout of the Header, composed of the event summary view and the search box.
define(['app', 'marionette', 'handlebars', 'text!templates/header-layout.html'],
    function (App, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            template: Handlebars.compile(template),

            regions: {
                searchRegion: "#search-region",
                summaryRegion: "#summary-region"
            },

            initialize: function () {
            },
        });
    });
