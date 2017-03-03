/*
 TodoMVC.RootLayout = Mn.View.extend({

 el: '#todoapp',

 regions: {
 header: '#header',
 main: '#main',
 footer: '#footer'
 }
 });
 */

define(['app', 'jquery', 'marionette', 'handlebars', 'text!templates/event.html'],
    function (App, $, Marionette, Handlebars, template) {
        return Marionette.View.extend({
            el: "body",

            regions: {
                headerRegion: "header",
                mainRegion: "#main",
                noticesRegion: '#notices',
                loginRegion: "#login"
            }
        });
    });
