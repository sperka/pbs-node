/**
 * Module dependencies
 */
var JobState = require('./jobstate')
	, Commands = require('./helpers/commands')
	, Executor = require('./executor')
	, ParseError = require('./helpers/errors').ParseError
	, N_A = 'N/A';

/**
 * Expose `Job`
 */
exports = module.exports = Job;

/**
 * `Job` is the representation of a PBS job.
 * @params If one parameter provided, it is set as the `id` of the `Job`. Two parameters mean `name` and `executableFile`.
 * @constructor
 */
function Job() {
	this.id					= '';
	this.name				= N_A;
	this.nodes				= N_A;
	this.ppn				= N_A;
	this.afterany			= [];
	this.afterOK			= [];
	this.variables			= {};
	this.submitArgs			= N_A;
	this.ctime				= N_A;
	this.qtime				= N_A;
	this.mtime				= N_A;
	this.stime				= N_A;
	this.comp_time			= N_A;

	this.owner				= N_A;
	this.executableFile		= N_A;
	this.wallTime			= N_A;
	this.queue				= N_A;
	this.status				= N_A;
	this.executeNode		= N_A;
	this.ellapsedTime		= N_A;
	this.usedMem			= N_A;
	this.usedcput			= N_A;
	this.errorPath			= N_A;
	this.outputPath			= N_A;
	this.VariablesList		= N_A;

	// one parameter = id
	if(arguments.length === 1) {
		this.id = arguments[0];
	}
	// two parameters = name / executableFile
	else if(arguments.length === 2) {
		this.name = arguments[0];
		this.executableFile = arguments[1];
	}
};

/**
 * Checks whether a property has a default N/A value.
 * @param prop The value of the property.
 * @return {Boolean} true if the property has its default N/A value
 */
Job.prototype.isPropNA = function(prop) {
	return prop === N_A;
};

/**
 * Queues the job to the PBS system.
 * @param callback The function that will be called after queueing the job. Signature: fn(err, result).
 */
Job.prototype.queue = function(callback) {
	var cmd = Commands.qsub, params = []
		, str = '', i;

	// 'qsub -N ' + this.name
	params.push('-N');
	params.push(this.name);

	// nodes/ppn
	if(!this.isPropNA(this.nodes)) {
		params.push('-l');
		str = 'nodes=' + this.nodes;
		if(!this.isPropNA(this.ppn)) {
			str += ':ppn=' + this.ppn;
		}
		params.push(str);
	}

	// afterOk
	if(this.afterOK.length > 0) {
		params.push('-W');
		str = 'depend=afterok';
		for(i=0; i<this.afterOK.length; i++) {
			str += ':' + this.afterOK[i];
		}
		params.push(str);
	}

	// afterAny
	if(this.afterany.length > 0) {
		params.push('-W');
		str = 'depend=afterany';
		for(i=0; i<this.afterany.length; i++) {
			str += ':' + this.afterany[i];
		}
		params.push(str);
	}

	// queue
	if(!this.isPropNA(this.queue)) {
		params.push('-q');
		params.push(this.queue);
	}

	// add executable file
	params.push(this.executableFile);

	// run qsub
	Executor.run({
		cmd: cmd
		, params: params
		, parser: Job.Parser.qsub
		, callback: callback
	});
};

/**
 * Builds the variables object from a `String`
 * @param varsStr Comma separated key=value pairs for variables.
 */
Job.prototype.analizeVariableList = function(varsStr) {
	var vars = varsStr.split(',')
		, i, _var, key, value;
	this.variables = {};

	for(i=0; i<vars.length; i++) {
		_var = vars[i].split('=');
		key = String.trim(_var[0]);
		value = String.trim(_var[1]);
		this.variables[key] = value;
	}
};

/**
 * Convenience method to check whether a `Job` is completed.
 * @return {Boolean} true if the `Job` has status of 'C' (Completed)
 */
Job.prototype.isComplete = function() {
	return this.status === 'C';
};

/**
 * Gets the duration in milliseconds from the time the `Job` was created until it was
 * last modified, changed state or changed locations.
 * @return {Number} The duration in milliseconds.
 */
Job.prototype.duration = function() {
	var mtimeMS, ctimeMS;
	mtimeMS = Date.parse(this.mtime);
	ctimeMS = Date.parse(this.ctime);

	return mtimeMS - ctimeMS;
};

/**
 * Lists the current `Job`s in the PBS system.
 * @param filterFn The filter function that returns a filtered `Array` of the `Job`s. If null, all `Job`s are returned.
 * @param callback The function that will be called after getting the `Job`s. Signature: fn(err, result).
 */
Job.listJobs = function(filterFn, callback) {
	var cmd = Commands.qstat
		, params = [];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Job.Parser.qstat
		, callback: function(err, result) {
			if(!err) {
				if(filterFn) {
					result = filterFn(result);
				}
				callback(null, result);
			}
			else { callback(err, null); }
		}
	});
};

/**
 * Searches `Job`s by name.
 * @param name The `name` to search for.
 * @param exactMatch The flag to indicate exact or partial match.
 * @param callback The function that will be called after getting the `Job`s. Signature: fn(err, result).
 */
Job.searchByName = function(name, exactMatch, callback) {
	Job.listJobs(
		function(result) {
			return Job.filterByName(result, name, exactMatch);
		}
		, callback
	);
};

/**
 * Filter method that returns a `Job` array with items meeting the conditions.
 * @param jobs The original `Job` array.
 * @param name The `name` value to filter on.
 * @param exactMatch The flag to indicate exact or partial match.
 * @return {Array} The filtered `Job` array.
 */
Job.filterByName = function(jobs, name, exactMatch) {
	if(!(jobs instanceof Array)) {
		jobs = [jobs];
	}
	return jobs.filterByFields({field: 'name', val: name, exactMatch: exactMatch});
};

/**
 * Gets a `Job` by its `id`. Provides full status.
 * @param jobId The `id` of the `Job`.
 * @param callback The function that will be called after getting the full status `Job`. Signature: fn(err, result).
 */
Job.getJobById = function(jobId, callback) {
	var cmd = Commands.qstatF
			, params = ['-f', jobId];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Job.Parser.qstatF
		, callback: callback
	});
};

/**
 * Gets the `status` of a `Job`.
 * @param jobId The `id` of the `Job`.
 * @param callback The function that will be called after getting the `Job`'s status. Signature: fn(err, result).
 */
Job.getJobStatus = function(jobId, callback) {
	Job.getJobById(jobId, function(err, job) {
		if(err) {
			callback(err, null);
		}
		else {
			callback(null, JobState.getState(job.status));
		}
	})
};

/**
 * Deletes current `Job` from the queue.
 * @param callback The function that will be called after deleting the `Job`. Signature: fn(err, result).
 */
Job.prototype.deleteJob = function(callback) {
	Job.deleteJob(this.id, callback);
}

/**
 * Delete a `Job` from the queue.
 * @param jobId The `id` of the `Job`.
 * @param callback The function that will be called after deleting the `Job`. Signature: fn(err, result).
 */
Job.deleteJob = function(jobId, callback) {
	var cmd = Commands.qdel
		, params = [jobId];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Job.Parser.qdel
		, callback: function(err, result) {
			if(!err) {
				callback(null, result);
			}
			else { callback(err, null); }
		}
	});
};

/**
 * Namespace for parser methods
 */
Job.Parser = {};

/**
 * Parses output of the `qstat` command.
 * @param data The output of the `qstat` command.
 * @return Returns an array of `Job` items.
 */
Job.Parser.qstat = function(data) {
	if(data instanceof Buffer) {
		data = new String(data);
	}

	var lines = data.split('\n')
		, i, line, lineParts
		, jobs = [], job;

	lines = lines.cleanLines();

	// skip first 2 lines
	i = 2;
	for(; i<lines.length; i++) {
		line = lines[i];
		lineParts = line.split(/\s+/);
		lineParts = lineParts.cleanLines();

		if(lineParts.length !== 6) {
			throw new ParseError('Invalid input for parsing job stat:\n' + line);
		}

		job = new Job();
		job.id = lineParts[0];
		job.name = lineParts[1];
		job.owner = lineParts[2];
		job.usedcput = lineParts[3];
		job.status = lineParts[4];
		job.queue = lineParts[5];

		jobs.push(job);
	}

	return jobs;
};

/**
 * Parses output of the `qstat -f job_id` command.
 * @param data The output of the `qstat -f` command.
 * @return Returns a `Job` instance with full status.
 */
Job.Parser.qstatF = function(data) {
	if(data instanceof Buffer) {
		data = new String(data);
	}

	var lines = data.split('\n')
		, i, lineParts
		, field, value
		, job
		, fields = require('./helpers/qstatF');

	lines = lines.cleanLines();

	job = new Job();

	for(i=0; i<lines.length; i=i+1) {
		lineParts = lines[i].split(' = ');
		if(lineParts.length === 1) {
			lineParts = lines[i].split(':');
			if(lineParts.length === 2) {
				lineParts[0] = String.trim(lineParts[0]);
				lineParts[1] = String.trim(lineParts[1]);
			}
		}

		field = lineParts[0];
		value = lineParts[1];

		if(fields[field] !== undefined) {
			if(job[fields[field]] !== undefined) {
				job[fields[field]] = value;
			}
		}
	}

	return job;
}

/**
 * Parses output of the `qsub` command.
 * @param data
 * @return Returns the `id` of the `Job`.
 */
Job.Parser.qsub = function(data) {
	if(data instanceof Buffer) {
		data = new String(data);
	}
	return data.replace('\n', '');
};

/**
 * Parses output of the `qdel` command.
 * @param data The output.
 * @return If success, returns an empty string; otherwise an error message.
 */
Job.Parser.qdel = function(data) {
	if(data instanceof Buffer) {
		data = new String(data);
	}
	return data.replace('\n', '');
};