var main = require('./main.js');

var args = process.argv.slice(2);
var filename = args[0];

if (filename.endsWith('.wkf')) {
    main.ExecuteWorkflow(filename, function (r, err) {
        console.log('Execution complete: ', r);
        //console.log('Execution complete: ', r, err)
    });
} else {
    main.RenderDocument(filename, function (r, err) {
        console.log('Execution complete: ', r, err);
    });
}