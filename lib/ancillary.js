var ancillary = require("../build/Release/ancillary");
var fs = require("fs");
var net = require("net");
var http = require("http");
var pt = require("path");
var events = require("events");
var crypto = require("crypto");
var pipe_wrap = process.binding("pipe_wrap");
var tcp_wrap = process.binding("tcp_wrap");

var Pipe = pipe_wrap.Pipe;

function md5(data){
    var hash = crypto.createHash("md5");
    hash.update(data,"utf8");
    return hash.digest("hex");
}

module.exports.attachHttp = function(server){
    server.on("connection",function(c){
        http._connectionListener.call(server,c);        
    });
    server.on("request",function(req,res){
        res._last = true;
		res.setHeader("Connection","close");
    });
}

module.exports.createServer = function(cb){
    var server = new events.EventEmitter();
    server.enableHttp = function(){
        module.exports.attachHttp(server);
    }
    if(cb){
        server.on("connection",cb);
    }

    server.listen = function(name){
        
        fs.unlink("/tmp/"+md5(name),function(err){
            
	        var p = new Pipe(true);
	        p.onconnection = function(c){	
		        c.onread = function(){				
			        var s = new net.Socket({handle:arguments[3]});
                    s.readable = s.writable = true;
			        server.emit("connection",s);
			        
			        s._handle.onread(arguments[0],arguments[1]+1,arguments[2]-1);
			        s.resume();
			        c.close();	
		        }
		        ancillary.makeIPC(c);
		        c.readStart();
	        }

	        p.bind("/tmp/"+md5(name));
	        p.listen();
        });
    }  

    return server;
}

module.exports.createHttpServer = function(cb){
    var s = module.exports.createServer();
    s.enableHttp();
    if(cb){
        s.on("request",cb);
    }
    return s;
}

module.exports.send = function(name,socket,data){
    if(socket.connection){
	
        var req = socket;
        socket = req.connection;
        data = req.method+" "+req.url+" HTTP/"+req.httpVersion+"\r\n";
        for(var h in req.headers){
            data+=h+": "+req.headers[h]+"\r\n";
        }
        data+= "\r\n";
		
		req.on("data",function(d){
			data += d;
		});
    }
    socket.pause();
    setTimeout(continueSend,0);	
	
	
	function continueSend(){
        data = " "+(data||"");
	    var p = new Pipe(true);
		try{
			p.connect("/tmp/"+md5(name)).oncomplete = function(){
				try{
					p.writeUtf8String(data,socket._handle).oncomplete = function(){};
					socket._handle.close();
					socket._handle = null;
				}catch(e){
					socket.destroy();
				}
			}
		}catch(e){
			socket.destroy();
		}
	}
}
