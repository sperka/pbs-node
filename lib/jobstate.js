/**
 * User: sph3r
 * Date: 5/7/12
 * Time: 10:47 PM
 */

exports = module.exports = JobState;

function JobState() {};

/**
 * Job is completed after having run
 */
JobState.Completed	= 'C';

/**
 * Job is exiting after having run.
 */
JobState.Existing	= 'E';

/**
 * Job is held.
 */
JobState.Held		= 'H';

/**
 * Job is queued, eligible to run or routed.
 */
JobState.Queued		= 'Q';

/**
 * Job is running.
 */
JobState.Running	= 'R';

/**
 * Job is being moved to new location.
 */
JobState.Moved		= 'T';

/**
 * Job is waiting for its execution time (-a option) to be reached.
 */
JobState.Waiting	= 'W';

/**
 * (Unicos only) job is suspended.
 */
JobState.Suspended 	= 'S';

// -------------------------------
/**
 * Reverse hash to maintain values from each direction.
 */
JobState.hash = {};
for(var key in JobState) {
	JobState.hash[JobState[key]] = key;
}

/**
 * Gets the state based on state value.
 * @param key The value used in PBS system.
 * @return The `JobState` value.
 */
JobState.getState = function(key) {
	return JobState.hash[key];
}