/**
 * Module dependencies.
 */
var Core = require('./core');

/**
 * Initialize a new `Machine`.
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
	this.mom_service_port = 0;
	this.mom_manager_port = 0;
	this.gpus = 0;
};

/**
 * Adds a new `Core` item to machine.
 * @param core The `Core` instance.
 */
Machine.prototype.addCore = function(core) {
	if(core instanceof Core) {
		this.cores.push(core);
	}
	else {
		throw new TypeError('Invalid core object added');
	}
}

/**
 * Removes a `Core` item from the machine.
 * @param core The actual `Core` item or its `id`
 */
Machine.prototype.removeCore = function(core) {
	// variable definitions
	var id, i;

	if(core instanceof String) {
		id = core;
	}
	else if(core instanceof Core) {
		id = core.id;
	}
	else {
		throw new TypeError('Parameter not an id or a Core object!');
	}

	for(i=this.cores.length-1; i>-1; i=i-1) {
		if(this.cores[i].id === id) {
			this.cores.splice(i, 1);
			break;
		}
	}
};

/**
 * Expose `Machine`
 */
exports = module.exports = Machine;
