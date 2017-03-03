define([
        'app',
        'backbone',
        'marionette',
        'models/event',
        'models/interrupt',
        'collections/events',
        'collections/interrupts',
        'views/header-view',
        'views/event-list',
        'views/event-entry-view',
        'views/event-summary-view',
        'views/login-view',
        'layouts/header-layout',
    ],
    function (App, Backbone, Marionette, Event, Interrupt, Events, Interrupts, HeaderView, EventList, EventEntryView, EventSummaryView, LoginView, HeaderLayout) {
        return Backbone.Marionette.Object.extend({
            initialize: function (options) {
                var layout = new HeaderLayout();
                var that = this;

                var login = new LoginView({
                    model: App.state
                });
                // App.root.showChildView('loginRegion', login);

                //App.headerRegion.show(layout);
                //App.layout = layout;

                var event1 = new Event({
                    title: "Event 1",
                    text: "Event 1 for 30 minutes"
                });

                var event2 = new Event({
                    title: "Event 2",
                    text: "Event 2"
                });

                //var collection = new OwnedGames([model1, model2]);
                var collection = new Events([event1, event2]);
                //var collection = new Events();
                App.collection = collection;
                //collection.fetch();

                // Re-fetch the collection if the decryption password changes.
                //App.state.on('change:passphrase', function () {
                //    console.log('Passphrase changed');
                //    collection.fetch();
                //});

                var e = new Event();

                App.eventSummaryView = new EventSummaryView({
                    model: e
                });

                App.eventEntryView = new EventEntryView({
                    model: e,
                    collection: collection
                });

                layout.render();
                layout.showChildView('summaryRegion', App.eventSummaryView);
                layout.showChildView('searchRegion', App.eventEntryView);

                //layout.summaryRegion.show(App.eventSummaryView);
                //layout.searchRegion.show(App.eventEntryView);

                //App.root.showChildView('mainRegion', new EventList({
                //     collection: App.collection
                //}));
                App.root.showChildView('mainRegion', layout);

                //App.vent.on("new_event", function () {
                //    that.renderHeader(new Event());
                //});

                // var interrupt1 = new Interrupt({
                //     type: 'DID_YOU_FINISH',
                //     event_title: 'Doing that thing'
                // });

                // var interrupt2 = new Interrupt({
                //     type: 'DID_YOU_FINISH',
                //     event_title: 'Doing that other thing'
                // });

                // var interrupts = new Interrupts([interrupt1, interrupt2]);

                // App.noticesRegion.show(new InterruptList({
                //     collection: interrupts
                // }));

                /*
                var actionableEvents = new ActionableEvents({
                    parent: collection
                }).child;

                // var actionableEvents = collection.subcollection({
                //     filter: function (event) {
                //         return true
                //     }
                // });

                App.noticesRegion.show(new InterruptList({
                    collection: actionableEvents
                }));
                */
            },

            list: function () {
                console.log('**** NAVIGATED TO LIST');
                App.state.set('location', 'home');

                // App.mainRegion.show(new WelcomeView({
                //model: new Event()
                //}));
            },

            index: function () {
                console.log('*** LOADING THE INDEX PAGE');
                // App.state.set('location', 'list');

                App.root.showChildView('mainRegion', new EventList({
                     collection: App.collection
                }));

                // App.collection.each(function (item, idx, z) {
                //     item.set('selected', false);
                // });

                // this.renderHeader(new Event());

                // _.invoke(collection.toArray(), 'destroy');


                //collection.create({
                //   title: 'Last of Us'
                //});
                //Backbone.sync("create", collection);

                // var view = new ReceiptList({
                //     collection: collection
                // });

                // layout.searchRegion.show(new GameSearchView({
                //     model: model1
                // }));

                // var layout = new BorrowGameLayout();
                // App.mainRegion.show(view);

                // App.mainRegion.show(layout);
                // App.root.showChildView('mainRegion', layout);
            },

            renderHeader: function (model) {
                App.layout.summaryRegion.show(new EventSummaryView({
                    model: model
                }));

                App.layout.searchRegion.show(App.eventEntryView = new EventEntryView({
                    model: model,
                    collection: App.collection
                }));
            },

            select: function (id) {
                console.log('Routing to select');
                var that = this;

                App.collection.each(function (item, idx, z) {
                    if (item.cid == id) {
                        item.set('selected', true);

                        // Models can not be re-bound to views, so re-render the whole page.
                        that.renderHeader(item);
                    } else {
                        item.set('selected', false);
                    }
                });
            }
        });
    });
