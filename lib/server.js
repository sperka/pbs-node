/**
 * User: sph3r
 * Date: 5/21/12
 * Time: 7:52 PM
 */

var Job = require('./job')
	, Cluster = require('./cluster')
	, Commands = require('./config').Commands
	, Executor = require('./executor');

function Server() { }

Server.listJobs = function(nameFilter, callback) {
	Job.searchByName(nameFilter, false, callback);
};

Server.queuedJobs = function(callback) {
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

Server.deleteJob = function(jobId, callback) {
	Job.deleteJob(jobId, callback);
};

Server.state = function(callback) {
	Cluster.getCluster(callback);
};

exports = module.exports = Server;