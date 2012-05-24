/**
 * Module dependencies.
 */
var Job = require('./job')
	, Cluster = require('./cluster')
	, Commands = require('./helpers/commands')
	, Executor = require('./executor');

/**
 * Represents a PBS server manager.
 * If running the `node` instance on the same server where PBS system runs, direct commands can be used;
 * otherwise, communication is through an `ssh` connection (using no-password login - with identities).
 * @param options See the docs.
 * @constructor
 */
function Server(options) {
	if(options.ssh) {
		// setup Executor ssh
	}
}

/**
 * Lists `Jobs` running on the PBS system.
 * @param nameFilter
 * @param callback
 */
Server.prototype.listJobs = function(nameFilter, callback) {
	Job.searchByName(nameFilter, false, callback);
};

/**
 * List the queued `Job`s on the PBS system.
 * @param callback The function that will be called after retrieving the `Job`s. Signature: fn(err, result).
 */
Server.prototype.queuedJobs = function(callback) {
	Job.listJobs(
		function(jobs) {
			return jobs.filterByFields([
					{ field: 'status', val: 'Q', exactMatch: true }
					, { field: 'status', val: 'H', exactMatch: true }
				]);
		}
		, callback
	);
};

/**
 * Delete a `Job` from the queue.
 * @param jobId The `id` of the `Job`.
 * @param callback The function that will be called after deleting the `Job`. Signature: fn(err, result).
 */
Server.deleteJob = function(jobId, callback) {
	Job.deleteJob(jobId, callback);
};

/**
 * Gets the current `Cluster`.
 * @param callback The function that will be called after getting the current `Cluster`. Signature: fn(err, result).
 */
Server.state = function(callback) {
	Cluster.getCluster(callback);
};

/**
 * Expose `Server`.
 */
exports = module.exports = Server;