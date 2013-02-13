var ancillary = require("../build/Release/ancillary");
var fs = require("fs");
var net = require("net");
var http = require("http");
var pt = require("path");
var events = require("events");
var pipe_wrap = process.binding("pipe_wrap");
var tcp_wrap = process.binding("tcp_wrap");
var httpjs = require("http.js");
var md5 = require("./md5.js");
var Pipe = pipe_wrap.Pipe;

module.exports.proxySpdy = require("./spdyroot.js");



module.exports.attachHttp = function(server,raw){
    if(raw){
        server.on("connection",function(c){
            var req = new httpjs.httpParser(c,true);
            req.on("open",function(res){
                if(req.headers.upgrade == "websocket" || req.headers.connection == "upgrade"){
					req.upgrade = true;
                    server.emit("upgrade",req,req.connection,new Buffer(0));
					req.on("data",function(d){
						//c.emit("data",d);
					});
                }else{					
                    server.emit("request",req,res);
                }
            });
        });
    }else{
        server.on("connection",function(c){
            http._connectionListener.call(server,c);        
        });
        server.on("request",function(req,res){
            res._last = true;
    		res.setHeader("Connection","close");        
        });
    }
}

module.exports.createServer = function(cb){
    var server = new events.EventEmitter();
    server.enableHttp = function(raw){
        module.exports.attachHttp(server,raw);
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

module.exports.createHttpServerOld = function(cb){
    var s = module.exports.createServer();
    s.enableHttp(false);
    if(cb){
        s.on("request",cb);
    }
    return s;
}
module.exports.createHttpServer = function(cb){
    var s = module.exports.createServer();
    s.enableHttp(true);
    if(cb){
        s.on("request",cb);
    }
    return s;
}

var connectionlist = {};
var queues = {};

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
        name = "/tmp/"+md5(name);
        var startprocessing = false;
        if(!queues[name]){
            queues[name] = [];
            startprocessing = true;
        }
        queues[name].push({handle:socket._handle,data:" "+(data||"")})
        
        if(startprocessing){
            process();
        }
    }
    
    function process(){
        if(queues[name].length){
            if(connectionlist[name]){
                continueSendHandle(connectionlist[name]);
            }else{
                try{
                var p = new Pipe(true);
        			p.connect(name).oncomplete = function(){    
                        connectionlist[name] = p;
                        continueSendHandle(p);                
        			}
                }catch(e){
                }
            }
        }else{
            delete queues[name];
        }
    }
    
    function continueSendHandle(p){
        try{
    		p.writeUtf8String(queues[name][0].data,queues[name][0].handle).oncomplete = function(a){
				queues[name].shift().handle.close();
                if(a < 0){
                    delete connectionlist[name];
                }
				process();
            };
        }catch(e){
        }
    }
}
