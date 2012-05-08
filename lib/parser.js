/**
 * User: sph3r
 * Date: 5/7/12
 * Time: 8:30 PM
 */

/**
 * Module dependencies
 */
var Machine = require('./machine')
	, Core = require('./core')
	, Job = require('./job')
	, JobStat = require('./JobStat')
	, Cluster = require('./cluster');

/**
 * Expose `Parser`
 */
exports = module.exports = Parser;

/**
 * Represents an error while parsing.
 * @param message
 * @constructor
 */
function ParseError(message) {
	this.name = 'ParseError';
	this.message = message;
};

/**
 * The `Parser` object. Responsible for parsing outputs.
 * @constructor
 */
function Parser() {};

/**
 * Parses output of `qnodes` command.
 * @param data
 * @return Returns a `Cluster` instance
 */
Parser.qnodes = function(data) {
	// variable definitions
	var lines = data.split('\n')
		, node, nCnt = 0, line
		, key, value
		, i, j = 0
		, machines = []
		, jobs = [], jobStr, job, coreIdx
		, cluster
	;

	lines = this.cleanLines(lines);

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

/**
 * Parses output of `qsub` command.
 * @param data
 * @return Returns the job Id.
 */
Parser.qsub = function(data) {
	var result = data.replace('\n', '');
	return result;
};

Parser.qstat = function(data) {
	var lines = data.split('\n')
		, i, line, lineParts
		, jobStats = [], jobStat;

	lines = this.cleanLines(lines);

	// skip first 2 lines
	i = 2;
	for(; i<lines.length; i++) {
		line = lines[i];
		lineParts = line.split(/\s+/);

		if(lineParts.length !== 6) {
			throw new ParseError('Invalid input for parsing job stat:\n' + line);
		}

		jobStat = new JobStat(lineParts[0], lineParts[1], lineParts[2], lineParts[3], lineParts[4], lineParts[5]);
		jobStats.push(jobStat);
	}

	return jobStats;
};

Parser.cleanLines = function(lines) {
	var i;
	// cleaning lines
	for(i=lines.length-1; i>-1; i--) {
		lines[i] = String.trim(lines[i]);
		if(lines[i] === '') {
			lines.splice(i, 1);
		}
	}

	return lines;
}

/**
 * Convenience method for getting rid of whitespaces in a `String`.
 * @param str
 * @return Cleaned `String` instance.
 */
String.trim = function(str) {
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};
