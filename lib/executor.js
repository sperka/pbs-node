/**
 * User: sph3r
 * Date: 5/9/12
 * Time: 10:33 PM
 */

var spawn = require('child_process').spawn;

function Executor() {
	this.useSSH = false;

};

Executor.prototype.run = function(options) {
	"use strict";

	var proc, output = '', result
		, cmd, params, error, success, parser;

	cmd = options.cmd;
	params = options.params;
	parser = options.parser;

	if(options.error && typeof options.error === 'function') {
		error = options.error;
	}
	else { error = options.callback; }
	if(options.success && typeof options.success === 'function') {
			success = options.success;
		}
		else {
			success = function(data) {
				options.callback(null, data);
			}
		}


	if(this.useSSH) {
		//proc = new SSH();
	}
	else {
		proc = spawn(cmd, params);
	}

	proc.stderr.on('data', function(data) {
		error(data);
	});

	proc.stdout.on('data', function(data) {
		if(data instanceof Buffer) {
			output += new String(data);
		}
		else if(data instanceof String) {
			output += data;
		}
		else {
			throw new TypeError('data error while catching stdout');
		}
	});

	proc.on('exit', function(code) {
		if(code) {
			error(code);
		}

		result = parser(output);
		success(result);
	});
};

Executor.run = function(options) {
	var executor = new Executor();
	executor.run(options);
};

/*
Executor.run = function(command, params, stdErrCallback, stdOutCallback, exitCallback) {
	var cmd;
	if(Executor.useSSH) {

	}
	else {
		cmd = spawn(command, params);
		cmd.stderr.on('data', function(data) {
			stdErrCallback(data);
		});
		cmd.stdout.on('data', function(data) {
			stdOutCallback(data);
		});
		if(exitCallback !== 'undefined') {
			cmd.on('exit', function(code) {
				exitCallback(code);
			});
		}
	}
};*/

exports = module.exports = Executor;
