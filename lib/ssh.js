/**
 * User: sph3r
 * Date: 5/19/12
 * Time: 10:51 PM
 */

var spawn = require('child_process').spawn
	, path = require('path')
	, ProcResult = require('./procresult');

function SSH(address, user) {
	this.address = address;
	this.user = user;

	this.buffers = {};
}

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

SSH.prototype.ssh = function(command, params, callback) {
	var proc = this.sshProc(command, params);
	this.listenProc(proc, callback);
};

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

SSH.prototype.scpUpload = function(localFiles, remotePath, callback) {
	var proc = this.scpDownloadProc(localFiles, remotePath);
	this.listenProc(proc, callback);
};

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

SSH.prototype.scpDownload = function(remoteFiles, localPath, callback) {
	var proc = this.scpDownloadProc(remoteFiles, localPath);
	this.listenProc(proc, callback);
};

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