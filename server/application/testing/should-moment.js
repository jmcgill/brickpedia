var should = require("should");
var moment = require("moment");

should.Assertion.add(
    // the name of the custom assertion
    'sameDay',

    // the implementation of the custom assertion
    function (time) {
        // `this.params` defines what text is associated with the
        // pass/fail state of your custom assertion
        this.params = {operator: 'to be equal to moment ' + time};

        // `this.obj` refers to the object in the should.js chain upon
        // which the assertion will be applied. `foo` would be `this.obj`
        // in this example:
        //
        //     foo.should.be.a.String;
        //
        var delta = moment.duration(moment(time).diff(this.obj)).asDays();
        (Math.floor(Math.abs(delta))).should.be.equal(0);
    },

    // is this a getter, meaning no function call?
    //
    //     foo.should.be.a.String         // getter
    //     foo.should.be.equal('string'); // not a getter
    //
    false
);
