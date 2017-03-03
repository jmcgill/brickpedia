var moment = require('moment');
var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');
var fibrous = require('fibrous');

var options = require('./options.js');
var workflow = require('./workflow.js');
var helpers = require('./helpers.js');
var d = require('./document.js');

function GetOutputFolder() {
    var id = moment().format("MMMM-Do-YYYY");
    var rootPath = path.join(process.cwd(), 'output', id);
    return rootPath;
}

function BeforeExecution() {
    // Generate a timestamp (and ID) for this run
    var rootPath = GetOutputFolder();

    // HACK
    options.rootPath = rootPath;

    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath);
        fs.mkdirSync(path.join(rootPath, 'workflows'));
        fs.mkdirSync(path.join(rootPath, 'documents'));
    }

    // Reset the stack which is used to capture state without having to have
    // workflows explicitely return data.
    __childStack = [];
    __children = {
        filename: 'root',
        children: []
    }
    __childStack.push(__children);

    __globals = {};

    return rootPath;
}

function ExecuteWorkflow(filename, done) {
    var rootPath = BeforeExecution();
    workflow.RunAsync(rootPath, filename, done);
}

function RenderDocument(filename, done) {
    var rootPath = BeforeExecution();
    console.log('Running....');
    fibrous(function () {
        var output = d.ParseDocument(path.join(process.cwd(), filename));
        console.log('Rendering complete');

        // Render to HTML
        var env = nunjucks.configure({autoescape: false});
        env.addFilter('json', function (obj) {
            return JSON.stringify(obj);
        });

        console.log(output);

        var rendered = nunjucks.render('server/templates/document.hbs', {
            blocks: output
        });

        // Write the resulting file to disk (everything is audited)
        fs.writeFileSync(
            path.join(rootPath, filename.replace('.doc', '.html')),
            rendered);

        return rendered;
    })(done);
}

module.exports = {
    'GetOutputFolder': GetOutputFolder,
    'BeforeExecution': BeforeExecution,
    'ExecuteWorkflow': ExecuteWorkflow,
    'RenderDocument': RenderDocument
}