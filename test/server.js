/**
 * User: sph3r
 * Date: 5/22/12 // Time: 11:46 AM
 */

var Server = require('../lib/server')
	, Job = require('../lib/job')
	, JobState = require('../lib/job')
	, Cluster = require('../lib/cluster')
	, should = require('should');

require('../lib/helpers');

describe('Server', function() {
	it('Should list jobs', function(done) {

		should.exist(Server);

		Server.listJobs('IL', function(err, result) {
			should.not.exist(err);

			result.should.be.an.instanceof(Array);
			result.length.should.be.above(0);

			var item = result[0];
			item.should.be.an.instanceof(Job);
			item.status.should.equal('R');

			done();
		});
	});

	it('Should show queued jobs', function(done) {
		Server.queuedJobs(function(err, result) {
			should.not.exist(err);

			result.should.be.an.instanceof(Array);
			result.length.should.be.above(0);

			var item = result[0];
			item.should.be.an.instanceof(Job);
			item.status.should.equal('Q');

			done();
		});
	});

	it('Should get server state', function(done) {
		Server.state(function(err, result) {
			should.not.exist(err);
			result.should.be.an.instanceof(Cluster);

			done();
		});
	});
});