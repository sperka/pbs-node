/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 8:48 PM
 */

/**
 * Module dependencies.
 */
var Core = require('./core');

/**
 * Expose `Machine`
 */
exports = module.exports = Machine;

/**
 * Initialize a new `Machine`
 * `Machine` is a representation of a computing machine.
 * @constructor
 */
function Machine() {
	this.name = '';
	this.cores = [];
	this.state = '';
	this.status = {};
	this.np = '';
	this.ntype = '';
}

/**
 * Adds a new `Core` to machine.
 * @param core The `Core` instance.
 */
Machine.prototype.addCore = function(core) {
	if(core instanceof Core) {
		this.cores.push(core);
	}
	else {
		throw new Error({name: 'Invalid core'});
	}
}

/**
 * Adds `Core` items to machine.
 * @param cores The array of `Core` instances.
 */
Machine.prototype.addCores = function(cores) {
	if(cores instanceof Array) {
		var i, len = cores.length;
		for(i=0; i<len; i=i+1) {
			this.addCore(cores[i]);
		}
	}
	else {
		throw new Error({});
	}
}

/**
 * Setter for cores.
 */
Machine.prototype.__defineSetter__('cores', function(val) {
	this.cores.length = 0;
	this.addCores(val); //TODO: check
});

/**
 * Removes a `Core` items from the machine.
 * @param core The actual `Core` item or its `id`
 */
Machine.prototype.removeCore = function(core) {
	var id, i, len = this.cores.length, c, idx = -1;

	if(core instanceof String) {
		id = core;
	}
	else if(core instanceof Core) {
		id = core.id;
	}
	else {
		throw new Error({});
	}

	for(i=0; i<len; i=i+1) {
		c = this.cores[i];
		if(c.id === id) {
			idx = i;
			break;
		}
	}
	if(idx > -1) {
		this.cores.splice(idx, 1);
	}
}
