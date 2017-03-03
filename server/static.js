var express = require('express');

module.exports.init = function (app) {
    app.use("/client", express.static(__dirname + '/../client'));
}
