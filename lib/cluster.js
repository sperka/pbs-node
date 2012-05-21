/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 9:30 PM
 */

/**
 * Module dependencies.
 */
var Machine = require('./machine')
	, Core = require('./core')
	, Job = require('./job')
	, Executor = require('./executor')
	, ParseError = require('./errors').ParseError;

/**
 * Expose `Cluster`.
 */
exports = module.exports = Cluster;

function Cluster() {
	this.nodes = [];
}

/*
Cluster.prototype.__defineSetter__('nodes', function(val) {
	if(val instanceof Array) {
		var i, len = val.length, n, ok = true;
		for(i=0; i<len; i=i+1) {
			n = val[i];
			if(!(n instanceof Machine)) {
				ok = false;
				break;
			}
		}
		if(ok) {
			this.nodes = val;
		}
		else {
			throw new Error({}); // There was an item which is not an instance of Machine.
		}
	}
	else {
		throw new Error({}); // Parameter has to be an array of Machine instances!
	}
});
*/

Cluster.getCluster = function(callback) {
	var cmd = './cmds/qnodes'
		, params = [];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Cluster.Parser.qnodes
		, callback: callback
	});
};

Cluster.Parser = {};
/**
 * Parses output of `qnodes` command.
 * @param data
 * @return Returns a `Cluster` instance
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

			// clean just in case
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
					// node.cores[coreIdx] = Job.getJobById(jobStr[1]); // TODO: Job.getJobById
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
