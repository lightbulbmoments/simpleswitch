module.exports = Rest;
function Rest(){
	var self = this;

	self.createServer = createServer;
	self.executeRequest = executeRequest;
	self.executeRawRequest = executeRawRequest;
	self.executeHttpGet = executeHttpGet;
	var restPlugin = require('./Express');

	function constructor(){

	}
	function createServer(config,cb){
		var rest = new restPlugin();
		rest.startService(config,cb);
	}
	function executeRequest(options,cb){
		var rest = new restPlugin();
		rest.executeRequest(options,cb);		
	}
	function executeRawRequest(options,cb){
		var rest = new restPlugin();
		rest.executeRawRequest(options,cb);
	}
	function executeHttpGet(options,cb){
		var rest = new restPlugin();
		rest.executeHttpGet(options,cb);
	}
	constructor();
}