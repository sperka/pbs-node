/**
 * User: sph3r
 * Date: 5/7/12
 * Time: 7:42 PM
 */

var Cluster = require('../lib/cluster')
		, should = require('should');

describe('Cluster', function() {
	it('Should initialize', function(done) {

		done();
	});

	it('Should get nodes', function(done) {
		Cluster.getNodes(function(err, result) {
			should.not.exist(err);

			console.log(result);
		});
	});
});