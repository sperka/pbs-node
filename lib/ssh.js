/**
 * Module dependencies and variables.
 */
var spawn = require('child_process').spawn
	, path = require('path')
	, fs = require('fs')
	, ProcResult = require('./procresult')
	, switchHash;

// hash to match passed options.
switchHash = {
	'bind_address'			: '-b'
	, 'cipher_spec'			: '-c'
	//, 'dyn_port_forward'	: '-D'
	, 'escape_char'			: '-e'
	, 'configfile'			: '-F'
	, 'pkcs11'				: '-I'
	, 'identity_file'		: '-i'
	, 'login_name'			: '-l'
	, 'mac_spec'			: '-m'
	, 'ctl_cmd'				: '-O'
	, 'option'				: '-o'
	, 'port'				: '-p'
	, 'ctl_path'			: '-S'
};

/**
 * SSH manager.
 * @param options The options to use when sending the command to the remote server.
 * @constructor
 */
function SSH(options) {
	this.options = options || {};
	this.buffers = {};

	console.assert(this.options.hostname, "Hostname required!");

	if(options.debug) {
		this.debug = options.debug;
	}
}

/**
 * Runs `ssh` command on local machine with the provided parameters. Returns the spawned process without handling any output.
 * @param command The command to run on the remote host.
 * @param params The parameters of the command.
 * @return ChildProcess instance.
 */
SSH.prototype.sshProc = function(command, params) {
	var proc, sshParams = []
		, switchKey
		, options = this.options;

	// add optional parameters if set in options
	for(switchKey in switchHash) {
		if(switchHash.hasOwnProperty(switchKey)) {
			if(options[switchKey]) {
				sshParams.push(switchHash[switchKey]);
				sshParams.push(options[switchKey]);
			}
		}
	}

	// [user@]hostname
	if(options.user && options.hostname) {
		sshParams.push(options.user + '@' + options.hostname);
	}
	else {
		sshParams.push(options.hostname);
	}

	// add the command and its parameters
	sshParams.push(command);
	sshParams = sshParams.concat(params);

	if(this.debug) {
		console.log('ssh ' + sshParams.join(' '));
	}

	proc = spawn('ssh', sshParams);
	return proc;
};

/**
 * Runs `ssh` command and returns the result through the callback.
 * @param command The command to run on the remote host.
 * @param params The parameters of the command.
 * @param callback The function that will be called after running the command on the remote host. Signature: fn(procResult).
 */
SSH.prototype.ssh = function(command, params, callback) {
	var proc = this.sshProc(command, params);
	this.listenProc(proc, callback);
};

/**
 * Run `scp` on local machine to upload files with the provided parameters.
 * Returns the spawned process without handling any output of it.
 * @param localFiles The paths of the files to upload.
 * @param remotePath The remote path to upload the files to.
 * @return The spawned child_process instance.
 */
SSH.prototype.scpUploadProc = function(localFiles, remotePath) {
	var scpParams = [], target, proc, options = this.options
		, i, switchKey;

	if(!(localFiles instanceof Array)) {
		localFiles = [localFiles];
	}

	// check if localFiles is a directory
	if(localFiles.length === 1) {
		if(!path.existsSync(localFiles[0])) {
			console.log('File/folder does not exist: ' + localFiles[0] + '\tignoring...');
			localFiles.splice(0, 1);
		}
		else {
			var stat = fs.statSync(localFiles[0]);
			if(stat.isDirectory()) {
				scpParams.push('-r');
			}
		}
	}
	else {
		for(i=localFiles.length-1; i>-1; i=i-1) {
			if(!path.existsSync(localFiles[i])) {
				console.log('File not exists: ' + localFiles[i] + '\tignoring...');
				localFiles.splice(i, 1);
			}
		}
	}

	if(localFiles.length === 0) {
		throw new Error('Local files don\'t exist. Quitting...');
	}

	if(options.user && options.hostname) {
		target = options.user + '@' + options.hostname + ':' + remotePath;
	}
	else {
		target = options.hostname + ':' + remotePath;
	}

	for(switchKey in switchHash) {
		if(switchHash.hasOwnProperty(switchKey)) {
			if(options[switchKey]) {
				scpParams.push(switchHash[switchKey]);
				scpParams.push(options[switchKey]);
			}
		}
	}

	scpParams = scpParams.concat(localFiles);
	scpParams.push(target);

	if(this.debug) {
		console.log('scp ' + scpParams.join(' '));
	}

	proc = spawn('scp', scpParams);

	return proc;
};

/**
 * Uploads files with `scp` command and returns the result through the callback.
 * @param localFiles The paths of the files to upload.
 * @param remotePath The remote path to upload the files to.
 * @param callback The function that will be called after uploading the files to the remote host. Signature: fn(err, result).
 */
SSH.prototype.scpUpload = function(localFiles, remotePath, callback) {
	var proc = this.scpUploadProc(localFiles, remotePath);
	this.listenProc(proc, callback);
};

/**
 * Run `scp` on local machine to download files from remote host with the provided parameters.
 * Returns the spawned process without handling any output of it.
 * @param remoteFiles The files on the remote host to download.
 * @param localPath The local path to download the files to.
 * @return The spawned child_process instance.
 */
SSH.prototype.scpDownloadProc = function(remoteFiles, localPath) {
	if(!(remoteFiles instanceof Array)) {
		remoteFiles = [remoteFiles];
	}

	var scpParams = [], remote, proc, switchKey, options = this.options;

	if(!path.existsSync(localPath)) {
		//console.log('Local path not exists: ' + localPath);
		throw new Error('Local path ('+ localPath +') does not exist. Quitting...');
	}

	for(switchKey in switchHash) {
		if(switchHash.hasOwnProperty(switchKey)) {
			if(options[switchKey]) {
				scpParams.push(switchHash[switchKey]);
				scpParams.push(options[switchKey]);
			}
		}
	}

	if(options.user && options.hostname) {
		remote = options.user + '@' + options.hostname + ':';
	}
	else {
		remote = options.hostname + ':';
	}
	remote += '""'; // two double quotes hack
	remote += remoteFiles.join(' ');
	remote += '""'; // two double quotes hack

	scpParams.push(remote);
	scpParams.push(localPath);

	if(this.debug) {
		console.log('scp ' + scpParams.join(' '));
	}

	proc = spawn('scp', scpParams);

	return proc;
};

/**
 * Downloads files with `scp` command and returns the result through the callback.
 * @param remoteFiles The files on the remote host to download.
 * @param localPath The local path to download the files to.
 * @param callback The function that will be called after downloading the files to the remote host. Signature: fn(err, result).
 */
SSH.prototype.scpDownload = function(remoteFiles, localPath, callback) {
	var proc = this.scpDownloadProc(remoteFiles, localPath);
	this.listenProc(proc, callback);
};

/**
 * The spawned child_process' listener. Gathers stdout and stderr data until the process ends.
 * @param proc The spawned child_process instance.
 * @param callback The function which is called after the process exists. Calls with a `ProcResult` instance as a parameter.
 */
SSH.prototype.listenProc = function(proc, callback) {
	var self = this;

	proc.stderr.on('data', function(data) {
		if(self.debug) {
			console.log('[ssh:stderr] ' + data);
		}

		if(self.buffers[proc.pid] === undefined) {
			self.buffers[proc.pid] = new ProcResult();
		}
		self.buffers[proc.pid].stderr += new String(data);
	});

	proc.stdout.on('data', function(data) {
		if(self.debug) {
			console.log('[ssh:stdout] ' + data);
		}

		if(self.buffers[proc.pid] === undefined) {
			self.buffers[proc.pid] = new ProcResult();
		}
		self.buffers[proc.pid].stdout += new String(data);
	});

	proc.on('exit', function(code) {
		if(self.debug) {
			console.log('[ssh:exit] ' + code);
		}

		if(self.buffers[proc.pid] === undefined) {
			self.buffers[proc.pid] = new ProcResult();
		}

		var procResult = self.buffers[proc.pid];
		procResult.exitCode = code;
		delete self.buffers[proc.pid];

		callback(procResult);
	});
};

exports = module.exports = SSH;