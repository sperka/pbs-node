/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 8:47 PM
 */

// 'register' convenience methods
require('./lib/helpers');

var pbs			= require('./lib/pbs')
	, Cluster	= pbs.Cluster
	, Job		= pbs.Job
	, Server	= pbs.Server;

/*
Cluster.getCluster(function(err, result) {
	console.log('Err: ' + err);
	console.log('Result: ' + JSON.stringify(result));
});

Job.searchJobsByName('IL', false, function(err, result) {
	console.log('Err: ' + err);
	console.log('Result: ' + JSON.stringify(result));
});*/

Server.queuedJobs(function(err, result) {
	//err.should.not.exist();

	console.log(result);

});

Job.getJobById('jobID', function(err, result) {
	console.log('Err: ' + err);
	console.log('Result: ' + JSON.stringify(result));
});

Job.getJobStatus('jobID', function(err, result) {
	console.log('Err: ' + err);
	console.log('Result: ' + JSON.stringify(result));
});