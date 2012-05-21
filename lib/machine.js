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
 * Initialize a new `Machine`
 * `Machine` is a representation of a computing machine.
 * @constructor
 */
function Machine() {
	this.name = '';
	this._cores = [];
	this.state = '';
	this.status = {};
	this.np = '';
	this.ntype = '';
	this.mom_service_port = 0;
	this.mom_manager_port = 0;
	this.gpus = 0;
};

/**
 * Adds a new `Core` to machine.
 * @param core The `Core` instance.
 */
Machine.prototype.addCore = function(core) {
	if(core instanceof Core) {
		this._cores.push(core);
	}
	else {
		throw new TypeError('Invalid core object added');
	}
}

/**
 * Setter for cores.
 */

Machine.prototype.__defineSetter__('cores', function(_cores) {
	this._cores.length = 0;
	if(_cores instanceof Array) {
		var i, len = _cores.length;
		for(i=0; i<len; i=i+1) {
			this.addCore(_cores[i]);
		}
	}
	else {
		throw new TypeError('Invalid parameter while setting cores property!');
	}
});
/**
 * Getter for cores.
 */
Machine.prototype.__defineGetter__('cores', function() {
	return this._cores;
})

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
		this._cores.splice(idx, 1);
	}
};

/**
 * Expose `Machine`
 */
exports = module.exports = Machine;
