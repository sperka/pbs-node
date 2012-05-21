/**
 * User: sph3r
 * Date: 5/7/12
 * Time: 7:42 PM
 */

var Cluster = require('../lib/cluster')
	, Machine = require('../lib/machine')
	, should = require('should');

require('../lib/helpers');

describe('Cluster', function() {
	it('Should initialize', function(done) {

		var cluster = new Cluster();
		should.exist(cluster);
		cluster.nodes.should.be.an.instanceof(Array);
		cluster.nodes.length.should.equal(0);

		done();
	});

	it('Should get cluster', function(done) {
		Cluster.getCluster(function(err, result) {
			should.not.exist(err);

			result.should.be.an.instanceof(Cluster);
			result.nodes.should.be.an.instanceof(Array);
			result.nodes.length.should.equal(2);

			var node = result.nodes[0];
			node.should.be.an.instanceof(Machine);

			console.log(result);
			done();
		});
	});
});