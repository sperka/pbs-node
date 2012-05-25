/**
 * Module dependencies
 */
var JobState = require('./jobstate')
	, Commands = require('./helpers/commands')
	, ParseError = require('./helpers/errors').ParseError
	, Executor = require('./executor');

/**
 * Expose `JobStat`.
 */
exports = module.exports = JobStat;

/**
 * `JobStat` represents the status of a `Job`
 * @param id The `id` of the `Job` assigned by PBS.
 * @param name The `name` given by the submitter of the `Job`.
 * @param user The `owner` of the `Job`.
 * @param timeUse The CPU time used.
 * @param status The `Job` state.
 * @param queue The `queue` in which the `Job` resides
 * @constructor
 */
function JobStat(id, name, user, timeUse, status, queue) {
	this.id			= id;
	this.name		= name;
	this.user		= user;
	this.timeUse	= timeUse;
	this.status		= status;
	this.queue		= queue;
}

/**
 * Lists the current `Job`s in the PBS system as `JobStat`s.
 * @param filterFn The filter function that returns a filtered `Array` of the `JobStat`s. If null, all `JobStat`s are returned.
 * @param callback The function that will be called after getting the `Job`s. Signature: fn(err, result).
 */
JobStat.listJobStats = function(filterFn, callback) {
	var cmd = Commands.qstat
			, params = [];

	Executor.run({
		cmd: cmd
		, params: params
		, parser: JobStat.Parser.qstat
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
 * Searches `JobStat`s by name.
 * @param name The `name` to search for.
 * @param exactMatch The flag to indicate exact or partial match.
 * @param callback The function that will be called after getting the `Job`s. Signature: fn(err, result).
 */
JobStat.searchByName = function(name, exactMatch, callback) {
	JobStat.listJobStats(
		function(result) {
			return JobStat.filterByName(result, name, exactMatch);
		}
		, callback
	);
};

/**
 * Filter method that returns a `JobStat` array with items meeting the conditions.
 * @param stats The original `JobStat` array.
 * @param name The `name` value to filter on.
 * @param exactMatch The flag to indicate exact or partial match.
 * @return {Array} The filtered `JobStat` array.
 */
JobStat.filterByName = function(stats, name, exactMatch) {
	if(!(stats instanceof Array)) {
		stats = [stats];
	}
	var result = stats.filterByFields({field: 'name', val: name, exactMatch: exactMatch});
	return result;
};


/**
 * Namespace for parser methods
 */
JobStat.Parser = {};

/**
 * Parses output of the `qstat` command.
 * @param data The output of the `qstat` command.
 * @return Returns an array of `JobStat` items.
 */
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