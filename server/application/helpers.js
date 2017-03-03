// @flow

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var fs = require('fs');
var csv = require('csv');

var fibrous = require('fibrous');
var XLSX = require('xlsx');

console.log('Loading workflow require');
var workflow = require('./workflow.js');
console.log(workflow);

var options = require('./options.js')
var s = require('./state.js');
var timeseries = require('./timeseries.js');

function UpdateFileMetadata(filename, metadata) {
    data = {};
    try {
        var data = fs.readFileSync('metadata.json');
        data = JSON.parse(data);
    } catch (e) {
        // File does not exist.
    }

    data[filename] = metadata;
    fs.writeFileSync('metadata.json', JSON.stringify(data));
}

function LoadFromCacheIfPossible(filename) {
    data = {};
    try {
        var data = fs.readFileSync('metadata.json');
        data = JSON.parse(data);
    } catch (e) {
        // File does not exist.
        return null;
    }

    var metadata = data[filename];
    if (!metadata) {
        return null;
    }

    var lastRunTimestamp = metadata.timestamp;

    // Is this file out of date?
    var stat = fs.statSync(filename);
    var lastModified = new Date(stat.mtime).getTime();
    if (lastModified > lastRunTimestamp) {
        return null;
    }

        // Walk through each child, and see if it has been modified since the last
    // time this file was generated.
    var r = RecursivelyCheckIfChildrenAreOutOfDate(
        metadata.children, lastRunTimestamp);

    // At least one child is out of date, recompute everything.
    if (r) {
        return null;
    }

    var cachedFilePath = path.join(metadata.rootPath, filename.replace('.wkf', '.csv'));
    var cachedChildrenPath = path.join(metadata.rootPath, filename.replace('.wkf', '.children'));
    return {
        data: CsvToWorkflowOutput(fs.readFileSync(cachedFilePath)),
        children: JSON.parse(fs.readFileSync(cachedChildrenPath))
    }
}

function RecursivelyCheckIfChildrenAreOutOfDate(state, timestamp) {
  for (var i = 0; i < state.children.length; ++i) {
      var child = state.children[i];
      var stat = fs.statSync(child.filename);
      var lastModified = new Date(stat.mtime).getTime();

      if (lastModified > timestamp) {
          return true;
      }

      if (child.children) {
          return RecursivelyCheckIfChildrenAreOutOfDate(child);
      } else {
          return false;
      }
  }
}

// Convert
function CsvToWorkflowOutput(data) {
    data = csv.sync.parse(data);
    header = data[0];
    data = data.slice(1);
    output = [];

    // When serialized, IDs are written as the first column. For processing,
    // they are stored as a property on the row.
    for (var i = 0; i < data.length; ++i) {
        id = data[i][0];
        row = data[i].slice(1);
        row._id = id;
        output.push(row);
    }

    return {
        Output: output,
        Header: header
    }
}

// Days between two dates
function DaysBetween(d1, d2) {
    var pd1 = d1.split('-');
    var pd2 = d2.split('-');
    var md1 = moment({year: pd1[0], month: pd1[1] - 1, day: pd1[2]});
    var md2 = moment({year: pd2[0], month: pd2[1] - 1, day: pd2[2]});
    var delta = moment.duration(md1.diff(md2)).asDays();
    return delta
}

// Simple filter. Use a function here so that later we can parse the input
// code and detect that the output variable is a Sum and how it was computed.
function Filter(data, fn) {
    var output = [];
    for (var i = 0; i < data.length; ++i) {
        var row = data[i];
        if (fn(row)) {
            output.push(row);
        }
    }
    return output;
}

// Simple sum. Use a function here so that later we can parse the input
// code and detect that the output variable is a Sum and how it was computed.
function Sum(data, fn) {
    var total = 0;
    for (var i = 0; i < data.length; ++i) {
        var row = data[i];
        var result = fn(row);

        // If our function returns undefined, it has filtered out this row.
        if (result) {
            total += result;
        }
    }
    return total;
}

// Cumulitive sum
//
// data: A 2-Dimensional, optionally sparse array of timeseries data
// column: The index of the column containing the data to sum
function CumSum(data, column) {
    var date = moment(options.epoch);
    var end = moment();
    var sum = 0;
    var rowIndex = 0;

    var output = [];

    while (date < end) {
        // Is this date in the (potentially) sparse dataset?
        var row = data[rowIndex];
        if (row) {
            var diff = date.diff(moment(row[0]), 'days');
            if (Math.abs(diff) <= 1) {
                sum += parseFloat(row[column]);
                rowIndex += 1;
            } else {
                // Don't advance the date if we hit a match, incase there are two matches.
                output.push([date.format("YYYY-MM-DD"), sum]);
                date.add(1, 'days');
            }
        } else {
            output.push([date.format("YYYY-MM-DD"), sum]);
            date.add(1, 'days');
        }
    }

    return output;
}

function ExpectEq(val, compare) {
    if (Array.isArray(val)) {
        // Shallow array equality
        if (JSON.stringify(val) == JSON.stringify(compare)) {
            return;
        }
    }

    if (val == compare) {
        return;
    }

    throw new Error("Failed expectation: " + val + " does not equal " + compare);
}

// Convert to/from structured and array-like data. Also sorts.
function RestructureOutput(r) {
    // Transform to and from 2D arrays and Labeled Objects
    if (Array.isArray(r.Output[0])) {
        // Sort output by date
        r.Output = r.Output.sort(function (a, b) {
            return (a[0] > b[0]) - (a[0] < b[0]);
        });

        // Transform to labeled data
        r.LabeledOutput = [];

        for (var j = 0; j < r.Output.length; j++) {
            var row = r.Output[j];
            var obj = {};
            for (var i = 0; i < r.Header.length; ++i) {
                obj[r.Header[i]] = row[i];
            }
            obj._id = row._id;
            r.LabeledOutput.push(obj);
        }
    } else {
        // Transform to 2D Array
        newOutput = [];
        for (var j = 0; j < r.Output.length; ++j) {
            var row = r.Output[j];
            var newRow = [];
            for (var i = 0; i < r.Header.length; ++i) {
                newRow.push(row[r.Header[i]]);
            }
            newRow._id = row._id;
            newOutput.push(newRow);
        }

        r.LabeledOutput = r.Output;
        r.Output = newOutput;

        // Sort output by date
        r.Output = r.Output.sort(function (a, b) {
            return (a[0] > b[0]) - (a[0] < b[0]);
        });
    }

    return r;
}

// Generate a root workflow by loading a file from disk.
// If the referenced file is a workflow, execute that workflow and load the resulting data instead.
function Load(quickname) {
    console.log('Workflow', workflow);
    if (quickname.endsWith('.wkf')) {
        var cachedCopy = LoadFromCacheIfPossible(quickname);
        if (cachedCopy) {
            console.log('Loaded from cache');
            var r = RestructureOutput(cachedCopy.data);
            __children = cachedCopy.children;

            return {
                data: r.Output,
                header: r.Header,
                ldata: r.LabeledOutput
            }
        }

        // TODO(jmcgill): What happens to children when loading from cache?
        __childStack.push(__children);

        // TODO(jmcgill): Unify models of state - does this do anything?
        var state = new s.WorkflowState();
        state.filename = quickname;
        state.children = [];

        // Any children collected during this run
        __children = state;

        var filename = path.join(process.cwd(), quickname);
        var contents = fs.readFileSync(filename, 'utf-8');

        console.log(workflow);
        var r = workflow.Run(filename, contents);

        r = RestructureOutput(r);

        var rootPath = options.rootPath;

        // Before writing files to disk, we output the _ID column for debugging.
        var dataToWrite = [];
        var headerToWrite = ['_ID'].concat(r.Header);
        for (var i = 0; i < r.Output.length; ++i) {
            var row = [r.Output[i]['_id']].concat(r.Output[i]);
            dataToWrite.push(row);
        }

        // Add the CSV header back to the time series data before writing to disk.
        // TODO(jmcgill): Does this belong in the Run function?
        var data = [headerToWrite].concat(dataToWrite);
        var contents = csv.sync.stringify(data);

        // Add the ID column
        fs.writeFileSync(path.join(rootPath, quickname.replace('.wkf', '.csv')), contents);

        // Write some information about the last time this file was generated.
        fileMetadata = {
            rootPath: rootPath,
            children: state,
            timestamp: Date.now()
        };
        UpdateFileMetadata(quickname, fileMetadata);

        __children = __childStack.pop();
        __children.children.push(state);

        // Write state (the most important part is the children)
        fs.writeFileSync(
            path.join(rootPath, quickname.replace('.wkf', '.children')),
            JSON.stringify(__children));

        // state.valid_until = lastUploaded.add(1, 'month');
        //__children = prevChildren;
        //__children.push(state);

        // Clear any temporary properties set on the data. This is needed
        // because it's possible (and sometimes useful) to abuse the fact
        // that Arrays are objects and set properties on the data during a
        // workflow.
        for (var i = 0; i < r.Output.length; ++i) {
            var row = r.Output[i];
            for (var key in row) {
                // This is an array, so numeric indices are expected
                if (!isNaN(parseInt(key, 10))) {
                    continue;
                }

                // Ignore internal properties
                if (key[0] == '_') {
                    continue;
                }

                delete row[key];
            }
        }

        // I am trying to emulate __children
        // console.log("AT THE END OF THIS FUNCTION: ", __children);
        // console.log("Compared to: ", state);

        return {
            data: r.Output,
            header: r.Header,
            ldata: r.LabeledOutput
        }
    } else {
        // Load the file from disk
        var filename = FindMostRecentUpload(quickname);
        console.log('***** Loading: ', filename);
        var lastUploaded = GetTimestampFromFilename(filename);

        var state = new s.WorkflowState();
        state.filename = filename;
        state.valid_until = lastUploaded.add(1, 'month');

        state.alerts = [];
        state.alerts.push({
            text: "This is a totally made up alert"
        });

        var data = fs.readFileSync(filename);
        if (filename.endsWith('.csv')) {
            data = csv.sync.parse(data);
        }

        if (filename.endsWith('.xslx')) {
            // For now just grab the first sheet.
            var workbook = XLSX.readFile(filename);
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            data = csv.sync.parse(XLSX.utils.sheet_to_csv(worksheet));
        }

        // Assign a unique ID to reach row
        for (var i = 0; i < data.length; ++i) {
            data[i]['_id'] = quickname + '-' + i;
        }

        // Push on to our workflow stack.
        __children.children.push(state);
        return data;
    }
}

function GetTimestampFromFilename(filename) {
    // Parse out the date.
    var g = filename.match(/([A-Za-z0-9]+)_(\d\d\d\d)_(\d\d)_(\d\d)/);
    if (!g) {
        return null;
    }

    var timestamp = moment({
        year: parseInt(g[2], 10),
        month: parseInt(g[3], 10) - 1,
        day: parseInt(g[4], 10)
    });

    return timestamp;
}

// Given a quick-name for an uploaded dataset, find the most recently saved
// version of that file. Return the path to that file.
//
// This assumes uploaded files are of the format:
//
//      quickname_yyyy_mm_dd.extension
//
// e.g.
//
//      betterment_2016_04_01.xslx
//
// which the chrome extension guarantees.
//
// TODO(jmcgill): Consider sniffing files to determin their origin.
function FindMostRecentUpload(quickname) {
    // Loop through all the files in the temp directory
    files = fs.readdirSync('inputs');

    var mostRecentMatchingFilename = null;

    for (var i = 0; i < files.length; ++i) {
        var filename = files[i];
        var filepath = path.join('/Users/jmcgill/Dropbox/projects/syw/inputs', filename)
        var stat = fs.statSync(filepath);

        // Ignore directories;
        if (!stat.isFile()) {
            continue;
        }

        // Ignore files that don't match the supplied quickname.
        if (!filename.startsWith(quickname)) {
            continue;
        }

        // Extract the timestamp from the path.
        var timestamp = GetTimestampFromFilename(filename);
        if (!timestamp) {
            continue;
        }

        console.log('Timestamp is: ', timestamp);
        if (!mostRecentMatchingFilename ||
            timestamp > GetTimestampFromFilename(mostRecentMatchingFilename)) {
            mostRecentMatchingFilename = filename;
        }
    }

    if (!mostRecentMatchingFilename) {
        throw new Error("No matching file found.");
    }

    return path.join('/Users/jmcgill/Dropbox/projects/syw/inputs', mostRecentMatchingFilename);
}

function Print(contents) {
    if (!Rendered) {
        Rendered = "";
    }

    Rendered += contents;
}

function LookupTimeseriesIndex(data, dateString) {
    return timeseries.LookupTimeseriesIndex(data, dateString);
}

// TODO(jmcgill): Consider just exporting an expectations framework?
module.exports = {
    'Load': Load,
    'ExpectEq': ExpectEq,
    'Filter': Filter,
    'Sum': Sum,
    'CumSum': CumSum,
    'Print': Print,
    'DaysBetween': DaysBetween,
    'LookupTimeseriesIndex': LookupTimeseriesIndex,
    'FindMostRecentUpload': FindMostRecentUpload
}