/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 9:30 PM
 */

/**
 * Module dependencies.
 */
var Machine = require('./machine');

/**
 * Expose `Cluster`.
 */
exports = module.exports = Cluster;


function Cluster() {
	this.nodes = [];
}

Cluster.prototype.__defineSetter__('nodes', function(val) {
	if(val instanceof Array) {
		var i, len = val.length, n, ok = true;
		for(i=0; i<len; i=i+1) {
			n = val[i];
			if(!(n instanceof Machine)) {
				ok = false;
				break;
			}
		}
		if(ok) {
			this.nodes = val;
		}
		else {
			throw new Error({}); // There was an item which is not an instance of Machine.
		}
	}
	else {
		throw new Error({}); // Parameter has to be an array of Machine instances!
	}
});