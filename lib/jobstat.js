/**
 * User: sph3r
 * Date: 5/7/12
 * Time: 11:59 PM
 */

var JobState = require('./jobstate')
	, Commands = require('./config').Commands
	, ParseError = require('./errors').ParseError
	, Executor = require('./executor');

exports = module.exports = JobStat;

function JobStat(id, name, user, timeUse, status, queue) {
	this.id			= id;
	this.name		= name;
	this.user		= user;
	this.timeUse	= timeUse;
	this.status		= JobState.getState(status);
	this.queue		= queue;
};

JobStat.filterByName = function(stats, name, exactMatch) {
	if(!(stats instanceof Array)) {
		stats = [stats];
	}
	var result = stats.filterByFields({field: 'name', val: name, exactMatch: exactMatch});
	return result;
};

JobStat.listJobStats = function(filterFn, callback) {
	var cmd = Commands.qstat
			, params = [];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: JobStat.Parser.qstat
		, callback: function(err, result) {
			if(!err) {
				result = filterFn(result);
				callback(null, result);
			}
			else { callback(err, null); }
		}
	});
};

JobStat.searchJobStatsByName = function(name, exactMatch, callback) {
	JobStat.listJobStats(
		function(result) {
			return JobStat.filterByName(result, name, exactMatch);
		}
		, callback
	);
};

/**
 * Namespace for parser methods
 */
JobStat.Parser = {};

JobStat.Parser.qstat = function(data) {
	if(data instanceof Buffer) {
		data = new String(data);
	}

	var lines = data.split('\n')
		, i, line, lineParts
		, jobStats = [], jobStat;

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

		jobStat = new JobStat(lineParts[0], lineParts[1], lineParts[2], lineParts[3], lineParts[4], lineParts[5]);
		jobStats.push(jobStat);
	}

	return jobStats;
};