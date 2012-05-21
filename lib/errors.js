/**
 * User: sph3r
 * Date: 5/20/12
 * Time: 9:59 PM
 */

/**
 * Represents an error while parsing.
 * @param message
 * @constructor
 */
function ParseError(message) {
	this.name = 'ParseError';
	this.message = message;
};

exports.ParseError = ParseError;