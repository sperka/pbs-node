/**
 * User: sph3r
 * Date: 5/19/12
 * Time: 10:51 PM
 */

var spawn = require('child_process').spawn;

function SSH(address, user) {
	this.address = address;
	this.user = user;



	this.ssh = spawn('ssh')
}




SSH.prototype.registerCommand = function(command) {

}