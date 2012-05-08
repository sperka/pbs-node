/**
 * User: sph3r
 * Date: 5/6/12
 * Time: 9:05 PM
 */

/**
 * Module dependencies
 */
var Job = require('./job');

/**
 * Expose `Core`
 */
exports = module.exports = Core;

/**
 * `Core` is a representation of a Machine's processing core.
 * @param id The `id` of a `Core`
 * @constructor
 */
function Core(id) {
	this.id = id;
	this._job = null;
}

/**
 * Sets `job` property with validation.
 * @param val The `Job` instance to set.
 */
Core.prototype.__defineSetter__('job', function(val) {
	if(val === null) {
		this._job = null;
	}
	else if(val instanceof Job) {
		this._job = val;
	}
	else {
		throw new TypeError('Job instance expected to set Core.job.');
	}
});

Core.prototype.__defineGetter__('job', function() {
	return this._job;
})