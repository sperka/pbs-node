/**
 * Helper functions.
 */
(function() {
	/**
	 * Convenience method to get rid of whitespaces in a `String`.
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

	/**
	 * Convenience method to get rid of empty strings in a `String` array.
	 * @return The array that doesn't contain empty `String` items.
	 */
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

	/**
	 * Convenience method to filter an `Array`'s items.
	 * @param settings Filter conditions that contain `field`, `val` and `exactMatch` parameters.
	 * @return {Array} The filtered `Array`.
	 */
	Array.prototype.filterByFields = function(settings) {
		if(!(settings instanceof Array)) {
			settings = [settings];
		}

		var i, j, setting, regex, result = [];
		for(i=0; i<this.length; i++) {
			for(j=0; j<settings.length; j++) {
				setting = settings[j];
				if(setting.exactMatch) {
					if(this[i][setting.field] === setting.val) {
						result.push(this[i]);
					}
				}
				else {
					regex = new RegExp(setting.val);
					if(regex.test(this[i][setting.field])) {
						result.push(this[i]);
					}
				}
			}
		}
		return result;
	}
})();
