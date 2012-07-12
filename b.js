var net = require("net");
var Pipe = process.binding("pipe_wrap").Pipe;
var anc = require("./build/Release/ancillary.node");
var events = require("events");
var fs = require("fs");
var crypto = require("crypto");

process.binding("tcp_wrap");



exports.createServer = function(){

	var server = new events.EventEmitter();
	server.listen = function(name){
		fs.unlink(
		var p = new Pipe(true);
		p.onconnection = function(c){
		
			c.onread = function(){				
				var s = new net.Socket({handle:arguments[3]});
				server.emit("connection",s);
				s._handle.onread(arguments[0],arguments[1],arguments[2]);
				s.resume();
				c.close();	
			}
			anc.makeIPC(c);
			c.readStart();
		}

		p.bind("/tmp/"+name);
		p.listen();
	}	
	
	return server;
}

exports.send = function(sock,name,data){
	data = data||"";
	var p = new Pipe(true);
	p.connect("/tmp/"+name).oncomplete = function(){
		sock.pause();
		p.writeUtf8String(data,sock._handle).oncomplete = function(){};
		sock._handle.close();
		sock._handle = null;
	}
}

