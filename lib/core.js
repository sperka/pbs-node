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
	this.job = null;
}