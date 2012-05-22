/**
 * User: sph3r
 * Date: 5/21/12 // Time: 1:05 PM
 */

var config = {}, testConfig = {};

config.Commands = {
	'qnodes'		: 'qnodes'
	, 'qsub'		: 'qsub'
	, 'qstat'		: 'qstat'
	, 'qstatF'		: 'qstat'
	, 'qdel'		: 'qdel'

};

testConfig.Commands = {
	'qnodes'		: './cmds/qnodes'
	, 'qsub'		: './cmds/qsub'
	, 'qstat'		: './cmds/qstat'
	, 'qstatF'		: './cmds/qstatF'
	, 'qdel'		: './cmds/qdel'
};


var qstatFConfig = {
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

config.JobFieldHash = qstatFConfig;
testConfig.JobFieldHash = qstatFConfig;


exports = module.exports = testConfig;