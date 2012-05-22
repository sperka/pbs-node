/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 9:24 PM
 */

var JobState = require('./jobstate')
	, JobStat = require('./jobstat')
	, cfg = require('./config')
	, Commands = cfg.Commands
	, Executor = require('./executor')
	, ParseError = require('./errors').ParseError;

/**
 * Expose `Job`
 */
exports = module.exports = Job;


function Job() {
	this.initBase();

	if(arguments.length === 1) {
		this.id = arguments[0];
	}
	else if(arguments.length === 2) {
		this.name = arguments[0];
		this.executableFile = arguments[1];
	}
};

Job.prototype.initBase = function() {
	this.NA = 'N/A';

	this.id					= '';
	this.name				= this.NA;
	this.nodes				= this.NA;
	this.ppn				= this.NA;
	this.afterany			= [];
	this.afterOK			= [];
	this.variables			= {};
	this.submitArgs			= this.NA;
	this.ctime				= this.NA;
	this.qtime				= this.NA;
	this.mtime				= this.NA;
	this.stime				= this.NA;
	this.comp_time			= this.NA;

	this.owner				= this.NA;
	this.executableFile		= this.NA;
	this.wallTime			= this.NA;
	this.queue				= this.NA;
	this.status				= this.NA;
	this.executeNode		= this.NA;
	this.ellapsedTime		= this.NA;
	this.usedMem			= this.NA;
	this.usedcput			= this.NA;
	this.errorPath			= this.NA;
	this.outputPath			= this.NA;
	this.VariablesList		= this.NA;
};

Job.prototype.isEmpty = function(prop) {
	return prop === this.NA;
}

Job.prototype.queue = function(callback) {
	var cmd = Commands.qsub, params = []
		, str = '', i;

	// 'qsub -N ' + this.name
	params.push('-N');
	params.push(this.name);

	// nodes/ppn
	if(!this.isEmpty(this.nodes)) {
		params.push('-l');
		str = 'nodes=' + this.nodes;
		if(!this.isEmpty(this.ppn)) {
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
	if(!this.isEmpty(this.queue)) {
		params.push('-q');
		params.push(this.queue);
	}

	// add executable file
	params.push(this.executableFile);

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Job.Parser.qsub
		, callback: callback
	});
};

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

Job.prototype.isComplete = function() {
	return this.status === 'C';
};

Job.prototype.duration = function() {
	return this.mtime - this.ctime; // TODO: Date
};

Job.listJobs = function(filterFn, callback) {
	var cmd = Commands.qstat
		, params = [];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Job.Parser.qstat
		, callback: function(err, result) {
			if(!err) {
				result = filterFn(result);
				callback(null, result);
			}
			else { callback(err, null); }
		}
	});
}

Job.searchByName = function(name, exactMatch, callback) {
	Job.listJobs(
		function(result) {
			return Job.filterByName(result, name, exactMatch);
		}
		, callback
	);
};

Job.filterByName = function(jobs, name, exactMatch) {
	if(!(jobs instanceof Array)) {
		jobs = [jobs];
	}
	var result = jobs.filterByFields({field: 'name', val: name, exactMatch: exactMatch});
	return result;
};

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

Job.deleteJob = function(jobId, callback) {
	var cmd = Commands.qdel
		, params = [jobId];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: Job.Parser.qdel
		, callback: function(err, result) {
			if(!err) {
				result = filterFn(result);
				callback(null, result);
			}
			else { callback(err, null); }
		}
	});
}

/**
 * Namespace for parser methods
 */
Job.Parser = {};

/**
 * Parses output of `qstat` command.
 * @param data
 * @return Returns an array of `JobStat` items.
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
 * Parses output of `qstat -f job_id` command.
 * @param data
 * @return Returns a `Job` instance.
 */
Job.Parser.qstatF = function(data) {
	if(data instanceof Buffer) {
		data = new String(data);
	}

	var lines = data.split('\n')
		, i, line, lineParts
		, field, value
		, job
		, fields = cfg.JobFieldHash;

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
 * Parses output of `qsub` command.
 * @param data
 * @return Returns the job Id.
 */
Job.Parser.qsub = function(data) {
	var result = data.replace('\n', '');
	return result;
};

Job.Parser.qdel = function(data) {
	var result = data.replace('\n', '');
	return result;
}