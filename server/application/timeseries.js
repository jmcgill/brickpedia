// Functions related to reading and writing timeseries data.
var moment = require("moment");

// Convert a reference to a date into a moment() object.
// Dates can either be specified in mm/dd/yyyy format, or as an offset relative
// to the current date e.g. 60 Years or 30 Days.
function ExpandDate(date) {
    if (date.match(/\d\d\d\d-\d\d-\d\d/)) {
        var t = moment(date);
        if (t.isValid()) {
            return moment(date);
        }
    }

    g = date.match(/(\d+) years/);
    if (g) {
        return moment().add(parseInt(g[1], 10), 'years');
    }

    g = date.match(/(\d+) days/);
    if (g) {
        return moment().add(parseInt(g[1], 10), 'days');
    }

    throw new Error("Invalid Date: " + date);
}

// foo {blah} goes to LookUpTimeseriesIndex(foo, date);
function FindAndReplaceDates(stanza) {
    var regex = /([^{^\s]+)\s*{([^}]+)}/g;
    return stanza.replace(regex, "helpers.LookupTimeseriesIndex($1, '$2')");
}

// Look up a date given a sorted timeseries with one entry per day.
// TODO(jmcgill): Should time-series be imported as an object instead, to
// avoid sparse arrays.
function LookupTimeseriesIndex(array, dateStr) {
    // Time series tables always have a date timestamp as the first column.
    dateStr = dateStr.replace(/\//g, '-');

    var firstDate = moment(array[0][0]);
    date = ExpandDate(dateStr);
    var offset = date.diff(firstDate, 'days');

    if (offset >= array.length) {
        throw new Error("Date not in dataset");
    }


    if (moment(array[offset][0]).diff(date, 'days') != 0) {
        throw new Error("Dataset contains sparse dates");
    }

    return array[offset][1];
}

module.exports = {
    'ExpandDate': ExpandDate,
    'FindAndReplaceDates': FindAndReplaceDates,
    'LookupTimeseriesIndex': LookupTimeseriesIndex
}