/**
 * Represents an error while parsing.
 * @param message
 * @constructor
 */
function ParseError(message) {
	this.name = 'ParseError';
	this.message = message;
};

/**
 * Expose `ParseError`
 */
exports.ParseError = ParseError;