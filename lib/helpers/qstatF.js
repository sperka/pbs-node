/**
 * `qstat -f` output fields.
 */
var qstatFFields = {
	'Job Id'					: 'id'
	, 'Job_Name'				: 'name'
	, 'Job_Owner'				: 'owner'
	, 'resources_used.cput'		: 'usedcput'
	, 'resources_used.mem'		: 'usedMem'
	, 'resources_used.walltime'	: 'wallTime'
	, 'job_state'				: 'status'
	, 'queue'					: 'queue'
	, 'ctime'					: 'ctime'
	, 'qtime'					: 'qtime'
	, 'mtime'					: 'mtime'
	, 'start_time'				: 'stime'
	, 'comp_time'				: 'comp_time'
	, 'exec_host'				: 'executeNode'
	, 'Output_Path'				: 'outputPath'
	, 'Error_Path'				: 'errorPath'
	, 'submit_args'				: 'submitArgs'
	, 'Variable_List'			: 'VariablesList'
};

/**
 * Expose the fields.
 */
exports = module.exports = qstatFFields;