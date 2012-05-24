/**
 * Module dependencies.
 */
var Machine = require('./machine')
	, Core = require('./core')
	, Job = require('./job')
	, Executor = require('./executor')
	, Commands = require('./helpers/commands')
	, ParseError = require('./helpers/errors').ParseError;

/**
 * Expose `Cluster`.
 */
exports = module.exports = Cluster;

/**
 * `Cluster` is a representation of a PBS cluster.
 * @constructor
 */
function Cluster() {
	this.nodes = [];
}

/**
 * Gets the current `Cluster`.
 * @param callback The function that will be called after getting the current `Cluster`. Signature: fn(err, result).
 */
Cluster.getCluster = function(callback) {
	var cmd = Commands.qnodes
		, params = [];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Cluster.Parser.qnodes
		, callback: callback
	});
};

/**
 * Namespace for parser methods
 */
Cluster.Parser = {};
/**
 * Parses output of the `qnodes` command.
 * @param data The output.
 * @return Returns a `Cluster` instance.
 */
Cluster.Parser.qnodes = function(data) {
	if(data instanceof Buffer) {
		data = new String(data);
	}
	// variable definitions
	var lines = data.split('\n')
		, node, nCnt = 0, line
		, key, value
		, i, j = 0
		, machines = []
		, jobs = [], jobStr, job, coreIdx
		, cluster
	;

	lines = lines.cleanLines();

	// reset i
	i = 0;
	// iterate through lines
	while(i<lines.length) {
		line = lines[i].split(' = ');

		// machine name
		if(line.length === 1) {
			node = new Machine();
			node.name = line[0];
			machines[nCnt] = node;
			nCnt++;
			jobs.length = 0;
		}
		// the rest
		else {
			// error if not `key = value` pair
			if(line.length !== 2) {
				throw new ParseError('Parsing error! Expected format: key = value [actual data: ' + line + ']');
			}

			// clean, just in case
			key = String.trim(line[0]);
			value = String.trim(line[1]);

			// np
			if(key === 'np') {
				node[key] = value;
				value = parseInt(value);
				for(j=0; j<value; j++) {
					node.cores[j] = new Core(new String(j));
				}
			}
			// jobs
			else if(key === 'jobs') {
				jobs = value.split(', ');
				for(j=0; j<jobs.length; j++) {
					jobStr = jobs[j].split('/');
					if(jobStr.length !== 2) {
						throw new ParseError('Invalid job format: ' + jobs[j]);
					}

					// save jobs to cores
					coreIdx = parseInt(jobStr[0]);
					// node.cores[coreIdx].job = Job.getJobById(jobStr[1]); // TODO: Job.getJobById
					node.cores[coreIdx].job = new Job(jobStr[1]);
				}
			}
			// check property and save
			else if(node.hasOwnProperty(key)) {
				node[key] = value;
			}
			else {
				throw new ParseError('Unrecognized key: ' + key + ' for the type Machine!');
			}
		}

		// next line
		i++;
	}

	// create `Cluster` instance and save `nodes`
	cluster = new Cluster();
	cluster.nodes = machines;

	return cluster;
};
