/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 8:47 PM
 */

var pbs			= require('./lib/pbs')
	, Cluster	= pbs.Cluster
	, Job		= pbs.Job;

/*
Cluster.getNodes(function(err, result) {
	console.log('Err: ' + err);
	console.log('Result: ' + JSON.stringify(result));
});
*/

Job.searchJobsByName('IL', false, function(err, result) {
	console.log('Err: ' + err);
	console.log('Result: ' + JSON.stringify(result));
});