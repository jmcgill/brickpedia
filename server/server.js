var express = require('express');
var cons = require('consolidate');

var app = module.exports.app = express();

app.configure(function () {
    app.set('views', 'templates');
    app.set('view engine', 'html');
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.engine('html', cons.handlebars);

    app.use(app.router);
});

// Routes
require('./routes.js').init(app);
require('./static.js').init(app);
// require('./api/events.js').init(app);
// require('./api/scheduler.js').init(app);

var port = process.env.PORT || 3002;
app.listen(port);