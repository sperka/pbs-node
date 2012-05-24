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

exports = module.exports = testConfig;