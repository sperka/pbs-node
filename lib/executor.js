/**
 * Module dependencies
 */
var spawn = require('child_process').spawn,
	SSH = require('./ssh'),
	ProcResult = require('./procresult');

/**
 * Represents a task executor.
 * @param ssh If defined, commands will be executed through an ssh connection; otherwise, locally.
 * @constructor
 */
function Executor(ssh) {
	if(ssh === undefined) {
		this.useSSH = false;
	}
	else {
		this.useSSH = true;
		this.ssh = ssh;
	}
}

/**
 * The method to run a task.
 * @param options The object with `cmd`, `params`, `parser`, `error`, `success` or `callback` parameters.
 */
Executor.prototype.run = function(options) {
	// variable defs
	var proc, procResult, result
		, cmd, params, error, success, parser;

	// the command to run
	cmd = options.cmd;
	// the params to use with cmd
	params = options.params;
	// the output parser function
	parser = options.parser;

	// if error function is provided, use that one
	if(options.error && typeof options.error === 'function') {
		error = options.error;
	}
	// if not, use callback function
	else { error = options.callback; }

	// if success function is provided, use that one
	if(options.success && typeof options.success === 'function') {
			success = options.success;
	}
	// if not, use callback function
	else {
		success = function(data) {
			options.callback(null, data);
		};
	}

	console.log('[executor:run] ' + cmd + ' ' + params);

	// create the process. either ssh or local process
	if(this.useSSH) {
		proc = this.ssh.sshProc(cmd, params);
	}
	else {
		proc = spawn(cmd, params);
	}

	procResult = new ProcResult();

	// listen stderr events
	proc.stderr.on('data', function(data) {
		console.log('[executor:proc:stderr] ' + data);
		procResult.stderr += data;
	});

	// listen stdout events
	proc.stdout.on('data', function(data) {
		if(data instanceof Buffer) {
			procResult.stdout += new String(data);
		}
		else if(data instanceof String) {
			procResult.stdout += data;
		}
		else {
			throw new TypeError('data error while catching stdout');
		}

		console.log('[executor:proc:stdout] ' + data);
	});

	// listen exit event
	proc.on('exit', function(code) {
		console.log('[executor:proc:exit] ' + code);
		procResult.exitCode = code;

		if(code) {
			error(code);
		}
		else {
			result = parser(procResult.stdout);
			success(result);
		}
	});
};

/**
 * Run a task.
 * @param options See `Executor.prototype.run` parameter.
 */
Executor.run = function(options) {
	var executor = new Executor(Executor.ssh);
	executor.run(options);
};

/**
 * Expose `Executor`.
 */
exports = module.exports = Executor;
