/**
 * Module dependencies.
 */
var Job = require('./job')
	, JobStat = require('./jobstat')
	, Cluster = require('./cluster')
	, SSH = require('./ssh')
	, Executor = require('./executor')
	, fs = require('fs');

/**
 * Represents a PBS server manager.
 * If running the `node` instance on the same server where PBS system runs, direct commands can be used;
 * otherwise, communication is through an `ssh` connection (using no-password login - with identities).
 * @param options See the docs.
 * @constructor
 */
function Server(options) {
	if(options.ssh) {
		// setup Executor ssh
		this.ssh = new SSH(options.ssh);

		// add reference to ssh instance
		Executor.ssh = this.ssh;
	}

	if(options.debug) {
		Executor.debug = options.debug;
	}
}

/**
 * Submit a `Job` instance to the queue.
 * @param job The `Job` instance.
 * @param callback The function that is called after submitting the `Job`.
 */
Server.prototype.submitJob = function(job, callback) {
	if(!(job instanceof Job)) {
		throw new TypeError('job parameter must be an instance of Job!');
	}

	job.enqueue(callback);
};

/**
 * Lists `Jobs` running on the PBS system.
 * @param callback The method to call with the `Job`s.
 */
Server.prototype.listAllJobs = function(callback) {
	Job.listJobs(null, callback);
};

/**
 * Lists `Jobs` running on the PBS system.
 * @param nameFilter
 * @param callback
 */
Server.prototype.listJobsByName = function(nameFilter, callback) {
	Job.searchByName(nameFilter, false, callback);
}

/**
 * List the queued `Job`s on the PBS system.
 * @param callback The function that will be called after retrieving the `Job`s. Signature: fn(err, result).
 */
Server.prototype.queuedJobs = function(callback) {
	Job.listJobs(
		function(jobs) {
			return jobs.filterByFields([
					{ field: 'status', val: 'Q', exactMatch: true }
					, { field: 'status', val: 'H', exactMatch: true }
				]);
		}
		, callback
	);
};

/**
 * Gets a `Job` by its `id`. Provides full status.
 * @param jobId The `id` of the `Job`.
 * @param callback The function that will be called after getting the full status `Job`. Signature: fn(err, result).
 */
Server.prototype.getJobById = function(jobId, callback) {
	Job.getJobById(jobId, callback);
}

/**
 * Delete a `Job` from the queue.
 * @param jobId The `id` of the `Job`.
 * @param callback The function that will be called after deleting the `Job`. Signature: fn(err, result).
 */
Server.prototype.deleteJob = function(jobId, callback) {
	Job.deleteJob(jobId, callback);
};

/**
 * Lists the current `Job`s in the PBS system as `JobStat`s.
 * @param callback The function that will be called after getting the `Job`s. Signature: fn(err, result).
 */
Server.prototype.listAllJobStats = function(callback) {
	JobStat.listJobStats(null, callback);
}


/**
 * Gets the current `Cluster`.
 * @param callback The function that will be called after getting the current `Cluster`. Signature: fn(err, result).
 */
Server.prototype.getState = function(callback) {
	Cluster.getCluster(callback);
};

/**
 * Uploads files with `scp` command and returns the result through the callback.
 * @param localFiles The paths of the files to upload.
 * @param remotePath The remote path to upload the files to.
 * @param callback The function that will be called after uploading the files to the remote host. Signature: fn(err, result).
 */
Server.prototype.uploadFiles = function(localFiles, remotePath, callback) {
	if(this.ssh) {
		this.ssh.scpUpload(localFiles, remotePath, callback);
	}
	else {
		if(!(localFiles instanceof Array)) { localFiles = [localFiles]; }

		var params = [];
		if(localFiles.length === 1) {
			params.push('-aR');
		}
		params = params.concat(localFiles);
		params.push(remotePath);
		Executor.run({
			cmd: 'cp'
			, params: params
			, parser: function(output) { return output; }
			, callback: callback
		});
	}
};

/**
 * Downloads files with `scp` command and returns the result through the callback.
 * @param remoteFiles The files on the remote host to download.
 * @param localPath The local path to download the files to.
 * @param callback The function that will be called after downloading the files to the remote host. Signature: fn(err, result).
 */
Server.prototype.downloadFiles = function(remoteFiles, localPath, callback) {
	if(this.ssh) {
		this.ssh.scpDownload(remoteFiles, localPath, callback);
	}
	else {
		if(!(remoteFiles instanceof Array)) { remoteFiles = [remoteFiles]; }
		var params = remoteFiles;
		params.push(localPath);
		Executor.run({
			cmd: 'cp'
			, params: params
			, parser: function(output) { return output; }
			, callback: callback
		});
	}
};

Server.prototype.downloadFolder = function(remotePath, localPath, callback) {
	// remove trailing slashes
	remotePath = remotePath.replace(/\/+$/, "");
	if(this.ssh) {
		this.ssh.scpDownload(remotePath, localPath, callback);
	}
	else {
		var params = ['-R', remotePath];
		params.push(localPath);
		Executor.run({
			cmd: 'cp'
			, params: params
			, parser: function(output) { return output; }
			, callback: callback
		});
	}
}

/**
 * Creates a directory on the server.
 * @param path The directory path.
 * @param callback The function that will be called after downloading the files to the remote host. Signature: fn(err, result).
 */
Server.prototype.mkdir = function(path, callback) {
	if(this.ssh) {
		this.ssh.ssh('mkdir', ['-p', path], callback);
	}
	else {
		fs.mkdir(path, 0777, callback);
	}
};

/**
 * Expose `Server`.
 */
exports = module.exports = Server;