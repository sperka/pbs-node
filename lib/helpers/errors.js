/**
 * Represents a parsing error.
 * @param message The message of the error.
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