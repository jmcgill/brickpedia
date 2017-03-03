var assert = require("assert");
var should = require("should");
var moment = require("moment");
var sinon = require('sinon');

var should_moment = require("./testing/should-moment.js");
var ts = require("./timeseries.js");

describe('ExpandDate()', function () {
    var clock = null;

    beforeEach(function () {
        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        clock.restore();
    });

    it('should expand a valid date', function () {
        var r = ts.ExpandDate('01/01/2016');
        r.should.be.sameDay("2016-01-01");
    })

    it('should calculate relative dates using days', function () {
        var r = ts.ExpandDate('2 Days');
        r.should.be.sameDay("1970-01-02");
    });

    it('should calculate relative dates using years', function () {
        // Offset is relative to 01-01-1970, since useFakeTimers resets the clock
        // to 0.
        var r = ts.ExpandDate('60 Years');
        r.should.be.sameDay("2029-12-31");
    });

    it('should throw exception on badly formatted date', function () {
        ts.ExpandDate.bind(null, '31/31/31').should.throw('Invalid Date');
    });

    it('should throw exception on invalid date', function () {
        ts.ExpandDate.bind(null, '31/31/2016').should.throw('Invalid Date');
    });

    it('should throw exception on poorly formed input', function () {
        ts.ExpandDate.bind(null, 'Bad String').should.throw('Invalid Date');
    });
})

describe('FindAndReplaceDates()', function () {
    it('should do nothing to code not containing dates', function () {
        var r = ts.FindAndReplaceDates('Nothing to replace');
        r.should.be.equal('Nothing to replace');
    });

    it('should replace dates', function () {
        var r = ts.FindAndReplaceDates('expand this {01/01/2017}');
        r.should.be.equal("expand LookupTimeseriesIndex(this, '01/01/2017')");
    });

    it('should replace dates without a space before brackets', function () {
        var r = ts.FindAndReplaceDates('expand this{01/01/2017}');
        r.should.be.equal("expand LookupTimeseriesIndex(this, '01/01/2017')");
    });

    it('should replace multiple dates', function () {
        var r = ts.FindAndReplaceDates('expand this {01/01/2017} and also that {02/02/2018}');
        r.should.be.equal("expand LookupTimeseriesIndex(this, '01/01/2017') "
            + "and also LookupTimeseriesIndex(that, '02/02/2018')");
    });
})

describe('LookupTimeseriesIndex()', function () {

    var data = [['01/06/2014', 'First Entry'],
        ['01/07/2014', 'Second Entry'],
        ['01/08/2014', 'Third Entry']];

    var sparseData = [['01/06/2014', 'First Entry'],
        ['01/10/2014', 'Second Entry'],
        ['01/15/2014', 'Third Entry']];

    it('should look up a valid date', function () {
        var r = ts.LookupTimeseriesIndex(data, '01/07/2014');
        r.should.containEql('Second Entry');
    });

    it('should throw exception on invalid date', function () {
        ts.LookupTimeseriesIndex.bind(null, data, '01/10/2014').should.throw('Date not in dataset');
    });

    it('should throw exception on sparse data', function () {
        ts.LookupTimeseriesIndex.bind(null, sparseData, '01/07/2014')
            .should.throw('Dataset contains sparse dates');
    });
})
