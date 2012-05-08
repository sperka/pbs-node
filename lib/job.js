/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 9:24 PM
 */

var Parser = require('./parser')
	, JobState = require('./jobstate')
	, JobStat = require('./jobstat')
	, spawn = require('child_process').spawn;

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
	this.SubmitArgs			= this.NA;
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
	this.errrorPath			= this.NA;
	this.outputPath			= this.NA;
	this.VariablesList		= this.NA;
};

Job.prototype.isEmpty = function(prop) {
	return prop === this.NA;
}

Job.prototype.queue = function(callback) {
	var cmd = 'qsub', params = []
		, str = '', i
		, qsub, output, result;

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

	// spawn process
	qsub = spawn(cmd, params);

	qsub.stderr.on('data', function(data) {
		callback(data, null);
	});

	qsub.stdout.on('data', function(data) {
		output += data;
	});

	qsub.on('exit', function(code) {
		result = Parser.qsub(output);
		callback(null, result);
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

Job.searchJobsByName = function(name, exactMatch, callback) {
	var qstat = spawn('./cmds/qstat', [])
		, output = '', result;

	qstat.stderr.on('data', function(data) {
		callback(data, null);
	});

	qstat.stdout.on('data', function(data) {
		//console.log('ondata: ' + data);
		output += data;
	});

	qstat.on('exit', function(code) {
		result = Parser.qstat(output);
		result = JobStat.filterByName(result, name, exactMatch);
		callback(null, result);
	});
};

Job.getJobById = function(jobId) {

};

Job.getJobInfo = function(jobId) {

};

Job.getJobState = function(jobId) {

};