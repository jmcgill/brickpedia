var assert = require("assert");
// var should = require("should"); 
var moment = require("moment");
// var sinon = require('sinon');
var chai = require('chai');

var should_moment = require("./testing/should-moment.js");
var workflow = require("./workflow.js");

describe('RunWithoutValidation()', function () {
    it('should execute a simple workflow', function () {
        var r = workflow.RunWithoutValidation('testdata/workflow.wkf');
        r.Output.should.be.equal(-42);
    })

    it('should be able to return multiple variables', function () {
        var r = workflow.RunWithoutValidation('testdata/multipleVariables.wkf');
        r.VariableOne.should.be.equal(1);
        r.VariableTwo.should.be.equal('James');

        // Lower case variables should not be exported.
        r.should.not.have.property('notExportedVariable');
    })
})

describe('Run()', function () {
    it('should execute a simple workflow which returns a timeseries', function () {
        var r = workflow.Run('testdata/validTimeseries.wkf');
        r.Output.should.not.be.null;
    })

    it('should throw an exception for non timeseries data', function () {
        workflow.Run.bind(null, 'testdata/noTimeseries.wkf').should.throw('Invalid date: 0');
    })

    it('should throw an exception for bad dates', function () {
        workflow.Run.bind(null, 'testdata/invalidDates.wkf').should.throw('Invalid date: 14/01/2017');
    })
})