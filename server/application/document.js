var marked = require('marked');
var fs = require('fs');

var workflow = require('./workflow.js');

function ParseDocument(path) {
    var contents = fs.readFileSync(path, 'utf-8');

    var lines = contents.split('\n');
    var output = [];
    var r;

    var lastBlock = "";

    __globals = {};

    // Assume that we begin with markdown, not code.
    var inMarkdown = true;

    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (line.startsWith('    ') || line.startsWith('\t')) {
            // This is code
            if (inMarkdown == true) {
                // Replace any references to inline variables.
                lastBlock = lastBlock.replace(
                    /{{ *([A-Za-z0-9_]+) *}}/g,
                    "<span class='tooltip variable'><span class='tooltiptext'>" +
                    "<span class='tooltiptext' id='$1'></span>" +
                    "</span><span class='variabletext' id='$1'></span></span>");

                // Render the last block of markdown.
                var newOutputBlock = {
                    type: "html",
                    contents: marked(lastBlock).replace(/\n/g, '<br>')
                }
                output.push(newOutputBlock);

                // We have moved on to a code stanza.
                inMarkdown = false;

                // Clear the Markdown content that we were tracking.
                lastBlock = "";
            }
        } else if (line.trim() != '') {
            // This is markdown
            if (inMarkdown == false) {
                __childStack = [];
                __children = {
                    filename: 'root',
                    children: []
                }
                __childStack.push(__children);

                // Execute the latest code.
                // HACK: Should run really care about the filename?
                r = workflow.Run("inline.wkf", lastBlock);

                // TODO(jmcgill): How will I do a graph?
                var newOutputBlock = {
                    type: "code",
                    contents: r.Rendered,
                    code: lastBlock,
                    data: r,
                    children: __children,
                    annotations: r.__state.annotations,
                    // HACK
                    id: '_' + Math.floor(Math.random() * 100000000)
                    // graph: ....
                }
                output.push(newOutputBlock);

                // We have moved on to a markdown stanza
                inMarkdown = true;

                // Clear the code content that we were tracking.
                lastBlock = "";
            }
        }

        if (line.startsWith('\t')) {
            // Replace the first tab
            line = line.replace('\t', '');
        }
        lastBlock += line + '\n';
    }

    // Handle any trailing content.
    // Replace any references to inline variables.
    lastBlock = lastBlock.replace(
        /{{ *([A-Za-z0-9_]+) *}}/g,
        "<span class='tooltip variable'><span class='tooltiptext'>" +
        "<span class='tooltiptext' id='$1'></span>" +
        "</span><span class='variabletext' id='$1'></span></span>");

    // Render the last block of markdown.
    var newOutputBlock = {
        type: "html",
        contents: marked(lastBlock).replace(/\n/g, '<br>')
    }
    output.push(newOutputBlock);

    // Now let's render all the output blocks to a file.
    return output;
}

module.exports = {
    ParseDocument: ParseDocument
}