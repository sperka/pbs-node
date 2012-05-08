/**
 * User: sph3r
 * Date: 5/7/12
 * Time: 11:59 PM
 */

var JobState = require('./jobstate');

exports = module.exports = JobStat;

function JobStat(id, name, user, timeUse, status, queue) {
	this.id			= id;
	this.name		= name;
	this.user		= user;
	this.timeUse	= timeUse;
	this.status		= JobState.getState(status);
	this.queue		= queue;
};

JobStat.filterByName = function(stats, name, exactMatch) {
	if(!(stats instanceof Array)) {
		stats = [stats];
	}

	var i, result = [];
	for(i=0; i<stats.length; i++) {
		if(exactMatch) {
			if(stats[i].name === name) {
				result.push(stats[i]);
			}
		}
		else {
			if(stats[i].name.indexOf(name) > -1) {
				result.push(stats[i]);
			}
		}
	}

	return result;
};