define(['app', 'marionette', 'handlebars', 'views/event-view', 'text!templates/event-list.html'],
    function (App, Marionette, Handlebars, View, template) {
        return Marionette.CompositeView.extend({
            template: Handlebars.compile(template),
            childView: View,
            childViewContainer: "#container",
            // childViewContainer: "li",

            events: {
                //    "click #container": "selectNone"
            },

            ui: {
                container: "#container"
            },

            initialize: function () {
            },

            attachHtml: function (collectionView, itemView, index) {
                var me = this;
                window.setTimeout(function () {
                    itemView.$el.hide();
                    me.ui.container.append(itemView.el);
                    //console.log(me.ui.container);
                    itemView.$el.fadeIn("slow");
                    // itemView.$el.css('position', 'relative');
                    // itemView.$el.css('left', '-200px');
                    // itemView.$el.animate({
                    //   'left': '0px'
                    //}, 500);
                }, 500 * 1);
            }
        });
    });
