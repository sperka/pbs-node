/**
 * Object to hold PBS commands.
 * @type {Object}
 */
var commands = {}, testCommands = {};

commands.Commands = {
	'qnodes'		: 'qnodes'
	, 'qsub'		: 'qsub'
	, 'qstat'		: 'qstat'
	, 'qstatF'		: 'qstat'
	, 'qdel'		: 'qdel'

};

testCommands.Commands = {
	'qnodes'		: './cmds/qnodes'
	, 'qsub'		: './cmds/qsub'
	, 'qstat'		: './cmds/qstat'
	, 'qstatF'		: './cmds/qstatF'
	, 'qdel'		: './cmds/qdel'
};

/**
 * Expose PBS commands.
 */
exports = module.exports = testCommands;