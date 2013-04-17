var ancillary = require("../build/Release/ancillary");
var fs = require("fs");
var net = require("net");
var pt = require("path");
var events = require("events");
var pipe_wrap = process.binding("pipe_wrap");
var tcp_wrap = process.binding("tcp_wrap");
var Pipe = pipe_wrap.Pipe;
var crypto = require("crypto");

function md5(data){
    var hash = crypto.createHash("md5");
    hash.update(data,"utf8");
    return hash.digest("hex");
}



module.exports.createServer = function(cb){
    var server = new events.EventEmitter();

    if(cb){
        server.on("connection",cb);
    }

    server.listen = function(name){        
        fs.unlink("/tmp/"+md5(name),function(err){            
	        var p = new Pipe(true);
	        p.onconnection = function(c){
		        c.onread = function(){
			        var s = new net.Socket({handle:arguments[3],allowHalfOpen:true});
                    s.readable = s.writable = true;
			        server.emit("connection",s);					
					var data = arguments[0].slice(arguments[1]+1,arguments[2]-1);
					arguments[3].onread(arguments[0],arguments[1]+1,arguments[2]-1);
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


var connectionlist = {};
var queues = {};

module.exports.send = function(name,socket,data){
    socket._handle.readStop();
	name = "/tmp/"+md5(name);
	var startprocessing = false;
	if(!queues[name]){
		queues[name] = [];
		startprocessing = true;
	}
	queues[name].push({socket:socket,handle:socket._handle,data:" "+(data||"")})
	
	if(startprocessing){
		process();
	}   
    
    function process(){
        if(queues[name].length){
            if(connectionlist[name]){
                continueSendHandle(connectionlist[name]);
            }else{
                try{
                var p = new Pipe(true);
        			p.connect(name).oncomplete = function(fd){
						if(fd >= 0){
							connectionlist[name] = p;
							p.onread = function(got){
								if(!got){
									p.shutdown().oncomplete = function(){};
									delete connectionlist[name];
								}
							};
							p.readStart();  
						}
						continueSendHandle(p);
        			}
                }catch(e){
					console.log(e);
                }
            }
        }else{
            delete queues[name];
        }
    }
    
    function continueSendHandle(p){
        try{
    		p.writeUtf8String(queues[name][0].data,queues[name][0].handle).oncomplete = function(a){
				var item = queues[name].shift();
				item.socket.destroy();
				process();
            };
        }catch(e){
			console.log(e);
        }
    }
}
