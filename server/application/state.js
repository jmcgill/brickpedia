// Application state
function ApplicationState() {
    // The state from the previous run.
    // TODO(jmcgill): How do I access the history from all runs?
    var lastRun = [];
}

// State captured during a single run.
function RunState() {
    // The time at which this run was performed.
    var time;

    // All alerts from any child workflows.
    var alerts = {};

    // An array of root workflows/documents for this state.
    var rootWorkflows = [];
}

// State captured during a single workflow. 
// TODO(jmcgill): Are workflows also documents?
function WorkflowState() {
    // The filename of the workflow executed.
    var filename;

    // Timestamp indicating when this result is valid until.
    var valid_until;

    // Any alerts generated during this execution.
    var alerts = [];

    // A tree containing the name of  all of the child workflows and files used
    // to generate the output of this workflow.
    var children = {};

    // Structured output from this execution.
    var structuredOutput = {};

    // Rendered output from this execution.
    var renderedOutput = "";
}

module.exports = {
    RunState: RunState,
    ApplicationState: ApplicationState,
    WorkflowState: WorkflowState
}