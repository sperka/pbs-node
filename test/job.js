/**
 * User: sph3r
 * Date: 5/21/12
 * Time: 9:11 PM
 */

var Job = require('../lib/job')
	, Machine = require('../lib/machine')
	, should = require('should');

require('../lib/helpers');

describe('Job', function() {
	it('Should exist', function(done) {
		should.exist(Job);
		done();
	});

	it('Should list jobs', function(done) {
		Job.listJobs(null, function(err, result) {
			should.not.exist(err);

			result.should.be.an.instanceof(Array);
			var i;
			for(i=0; i<result.length; i++) {
				result[i].should.be.an.instanceof(Job);
			}

			done();
		});
	});

	it('Should manage a job', function(done) {
		// create a job instance

		// queue

		// show queued jobs

		// get job by id

		// delete job

	});
});