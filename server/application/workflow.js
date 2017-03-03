// Functions for executing SYW workflows.
module.exports = {
    'RunWithoutValidation': RunWithoutValidation,
    'Run': Run,
    'RunAsync': RunAsync
}

var fs = require('fs');
var path = require('path');
var coffee = require('coffee-script');
var format = require('string-format');
var moment = require('moment');
var fibrous = require('fibrous');
var csv = require('csv');

var options = require('./options.js');
var timeseries = require('./timeseries.js');
var helpers = require('./helpers.js');

format.extend(String.prototype);

function GetDescription(stanza) {
    var description = "";

    var rows = stanza.split('\n');
    for (var i = 0; i < rows.length; ++i) {
        var row = rows[i].trim();
        if (row[0] == '#') {
            description += row.substr(2) + ' ';
        } else {
            break;
        }
    }

    return description;
}

// Verify (roughly) that dates are in YYYY-MM-DD format
function ValidateDate(dateString) {
    // Cooerce to a string.
    dateString = '' + dateString;

    var g = dateString.match(/(\d\d\d\d)-(\d\d)-(\d\d)/);
    if (!g) {
        return false;
    }

    // Is the month valid?
    if (g[2] < 1 || g[2] > 12) {
        return false;
    }

    // Rely on moment for the rest (e.g. correct number of days in a month)
    var m = moment(dateString);
    if (!m.isValid()) {
        return false;
    }

    return true;
}

function LineSetsExportedVariable(exportedVariables, line) {
    var g = /^([A-Za-z0-9_]+) =/.exec(line);
    if (!g) {
        return null;
    }

    variableName = g[1];
    if (!exportedVariables[variableName]) {
        return null;
    }

    return variableName;
}

function RunAsync(rootPath, filename, fn) {
    // HACK
    options.rootPath = rootPath;

    var asyncFunc = fibrous(function () {
        // Executing a workflow is the same as loading it from within another
        // workflow
        return helpers.Load(filename);

        //var contents = fs.readFileSync(filename, 'utf8');
        //var r = Run(filename, contents);

        //r.Output = r.Output.sort(function (a, b) {
        //    return (a[0] > b[0]) - (a[0] < b[0]);
        //});

        // Add the CSV header back to the time series data before writing to disk.
        // var data = [r.Header].concat(r.Output);
        // var contents = csv.sync.stringify(data);
        // fs.writeFileSync(path.join(rootPath, filename.replace('.wkf', '.csv')), contents);

        // Write the state for this execution
        // fs.writeFileSync(path.join(rootPath, filename.replace('.wkf', '.state')), JSON.stringify(r.__state));

        return data;
    });
    asyncFunc(filename, fn);
}

// Execute a workflow and return variables without performing any validation.
function RunWithoutValidation(filename, contents) {
    if (!__children) {
        __children = [];
    }
    Rendered = '';


    // Load the worksheet from disk.
    var workflow = contents;

    // Expand timeseries references.
    workflow = timeseries.FindAndReplaceDates(workflow);

    // Get the description for this workflow.
    var description = GetDescription(workflow);

    // State for this execution.
    var state = {
        generatedBy: filename,
        description: description
    };

    // Produce a map containing the name of all variables to be exported. Exported
    // variables begin with a capital letter.
    // Always export any rendered data.
    var exportedVariables = {
        'Rendered': true
    };

    tokens = coffee.tokens(workflow);
    for (var i in tokens) {
        var token = tokens[i];
        if (token[0] == 'IDENTIFIER') {
            if (token[1][0] == token[1][0].toUpperCase()) {
                exportedVariables[token[1]] = true;
            }
        }
    }

    // Extract annotations
    var annotations = {};
    var currentComment = "";
    var lines = workflow.split('\n');
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].trim();
        var variable = LineSetsExportedVariable(exportedVariables, line);

        if (line.startsWith('#')) {
            // This is a comment.
            currentComment += line.substr(1).trim();
        } else if (variable) {
            // This line sets the value of a variable we care about.
            annotations[variable] = currentComment;
        } else {
            // We reset comments when encountaring an empty line or a line we don't grok
            currentComment = "";
        }
    }

    state['annotations'] = annotations;

    // Convert CoffeeScript to Javascript
    workflow = coffee.compile(workflow);

    // Modify the executed code so that all exported variables are returned.
    var components = [];
    for (var key in exportedVariables) {
        components.push('"{0}": {0}'.format(key));
    }

    //var retStatement = 'sywDone({{ {0} }});'.format(components.join(','));
    var retStatement = 'return {{ {0} }};'.format(components.join(','));

    // Remove unecessary closure wrapping.
    var lines = workflow.split('\n');
    workflow = lines.slice(1, lines.length - 2).join('\n');

    // Load in additional libraries as required.
    workflow = "var helpers = require ('./helpers.js');\n" + workflow;

    // Append return statement to code before execution.
    // workflow = workflow.replace('}).call(this);', retStatement + '}).call(this);');

    // Copy over global variables.
    var globalsText = "var globals = " + JSON.stringify(__globals) + "\n";
    workflow = globalsText + workflow;

    // Wrap the entire call in a fiber
    //workflow = "var fibrous=require('fibrous');\nvar sywAsyncFunction = fibrous(function () {" +
    //    workflow + "\n" + retStatement + "});";
    workflow = "var sywAsyncFunction = function () {" +
        workflow + "\n" + retStatement + "};";

    // Wrap the entire call in an anonymous function and return the fiber
    var code = '(function() {{ {0}; return sywAsyncFunction }})();'.format(
        workflow);

    // Execute and return an object containing all exported variables, as well as the
    // local state.
    console.log('About to run code');
    var fibrousFunc = eval(code);
    var r = fibrousFunc();
    console.log('Running code complete');

    state.children = __children;
    console.log('WRITING CHILDREN TO ROOT FUNCTION: ', __children);
    console.log('\n\n\n')
    r.__state = state;

    // Copy exported variables into globals.
    for (var key in exportedVariables) {
        // Skip pre-defined key names
        if (key == 'Rendered' ||
            key == 'Error' ||
            key == 'Output' ||
            key == 'Header' ||
            key == 'Math') {
            continue;
        }

        if (key in __globals) {
            throw new Error('Duplicated wexported variable: ' + key);
        }

        // Copy over the value from the return statement.
        __globals[key] = r[key];
    }
    return r;
}

// Execute a workflow and verify that Output is a sorted, non-spare timeseries
// dataset.
function Run(filename, contents) {
    var r = RunWithoutValidation(filename, contents);

    // Is there an Output which requires validation?
    if (!r.Output) {
        return r;
    }

    // Is Output a 2-Dimensional array?
    //if (!Array.isArray(r.Output) || (!Array.isArray(r.Output[0]) || !) {
    //	throw new Error("Output is not a 2-Dimensional array");
    //}

    // Is every entry in the first column a valid date?
    var invalidDate = null;
    for (var i = 0; i < r.Output.length; ++i) {
        var row = r.Output[i];
        if (!ValidateDate(row[0])) {
            invalidDate = row[0];
            break;
        }
    }

    if (invalidDate != null) {
        throw new Error("Invalid date: " + invalidDate);
    }

    return r;
}