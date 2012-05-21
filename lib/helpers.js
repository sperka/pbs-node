/**
 * User: sph3r
 * Date: 5/20/12
 * Time: 9:54 PM
 */

(function() {
/**
 * Convenience method for getting rid of whitespaces in a `String`.
 * @param str
 * @return Cleaned `String` instance.
 */
String.trim = function(str) {
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};

Array.prototype.cleanLines = function() {
	var i;
	// cleaning lines
	for(i=this.length-1; i>-1; i--) {
		if(!( (this[i] instanceof String) || (typeof this[i] === 'string')) ) {
			continue;
		}
		this[i] = String.trim(this[i]);
		if(this[i] === '') {
			this.splice(i, 1);
		}
	}

	return this;
};
})();
