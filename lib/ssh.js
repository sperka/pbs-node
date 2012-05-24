/**
 * Module dependencies.
 */
var spawn = require('child_process').spawn
	, path = require('path')
	, ProcResult = require('./procresult');

/**
 * SSH manager.
 * @param address The address/ip/hostname (if set in /etc/hosts) of the remote host.
 * @param user The user with which to connect to the remote host.
 * @constructor
 */
function SSH(address, user) {
	this.address = address;
	this.user = user;

	this.buffers = {};
}

/**
 * Run `ssh` on local machine with the provided parameters. Returns the spawned process without handling any output of it.
 * @param command The command to run on the remote host.
 * @param params The parameters of the command.
 * @return The spawned child_process instance.
 */
SSH.prototype.sshProc = function(command, params) {
	var proc, sshParams = [];

	// add "-l user <hostname>" to the beginning with opening ''
	sshParams.concat(['-l', this.user, this.address, '\'\'']);
	sshParams.push(command);
	sshParams.concat(params);
	// add closing '' at the end
	sshParams.push('\'\'');

	proc = spawn('ssh', params);

	return proc;
};

/**
 * Runs an `ssh` command and returns the result through the callback.
 * @param command The command to run on the remote host.
 * @param params The parameters of the command.
 * @param callback The function that will be called after running the command on the remote host. Signature: fn(err, result).
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
	if(!(localFiles instanceof Array)) {
		localFiles = [localFiles];
	}

	var i, params, target, proc;
	for(i=localFiles.length-1; i>-1; i=i-1) {
		if(!path.existsSync(localFiles[i])) {
			console.log('File not exists: ' + localFiles[i]);
			localFiles.splice(i, 1);
		}
	}
	if(localFiles.length === 0) {
		return; // TODO: throw error
	}

	target = this.user + '@' + this.address + ':' + remotePath;
	params = localFiles;
	params.push(target);

	proc = spawn('scp', params);

	return proc;
};

/**
 * Uploads files with `scp` command and returns the result through the callback.
 * @param localFiles The paths of the files to upload.
 * @param remotePath The remote path to upload the files to.
 * @param callback The function that will be called after uploading the files to the remote host. Signature: fn(err, result).
 */
SSH.prototype.scpUpload = function(localFiles, remotePath, callback) {
	var proc = this.scpDownloadProc(localFiles, remotePath);
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

	var i, params = [], target, proc;
	if(!path.existsSync(localPath)) {
		console.log('Local path not exists: ' + localPath);
		return; // TODO: throw proper error
	}

	target = this.user + '@' + this.address + ':"';
	target += remoteFiles.join(' ');
	target += '"';

	params.push(target);
	params.push(localPath);

	proc = spawn('scp', params);

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
		if(self.buffers[proc.pid] === undefined) {
			self.buffers[proc.pid] = new ProcResult();
		}
		self.buffers[proc.id].stderr += new String(data);
	});

	proc.stdout.on('data', function(data) {
		if(self.buffers[proc.pid] === undefined) {
			self.buffers[proc.pid] = new ProcResult();
		}
		self.buffers[proc.id].stdout += new String(data);
	});

	proc.on('exit', function(code) {
		if(self.buffers[proc.pid] === undefined) {
			self.buffers[proc.pid] = new ProcResult();
		}

		var procResult = self.buffers[proc.id];
		procResult.exitCode = code;
		delete self.buffers[proc.id];

		callback(procResult);
	});
};