/**
 * Represents a child_process' result after spawning and quitting.
 * @constructor
 */
function ProcResult() {
	this.stderr = '';
	this.stdout = '';
	this.exitCode = NaN;
}

/**
 * Expose `ProcResult`.
 * @type {*}
 */
exports = module.exports = ProcResult;