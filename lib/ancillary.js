var ancillary = require("../build/Release/ancillary");
var net = require("net");
var http = require("http");
var pt = require("path");
var events = require("events");
var crypto = require("crypto");

function md5(data){
    var hash = crypto.createHash("md5");
    hash.update(data,"utf8");
    return hash.digest("hex");
}


module.exports.attach = function(server){
    server.on("connection",function(c){
        
        var fd = -1;
        while(fd < 0){
            fd = ancillary.Receive(ancillary.GetFD(c._handle));
        }
        
        var data = "";
        c.on("data",function(d){
            data += d.toString("binary");
        });
        c.on("end",function(){
            try{
                var socket = new net.Socket(fd);        
                socket.readable = socket.writable = true;
                server.emit("passedConnection",socket,JSON.parse(new Buffer(data,"binary")+""));
                socket.resume();
            }catch(e){
            }
        });       
    });
}

module.exports.attachHttp = function(server){
    server.on("passedConnection",function(c,data){
        http._connectionListener.call(server,c);
        c.ondata(new Buffer(data,"binary"),0,data.length);
        
    });
    server.on("request",function(req,res){
        res._last = true;
		res.setHeader("Connection","close");
    });
}

module.exports.createServer = function(cb){
    var server = net.createServer();
    module.exports.attach(server);
    server.enableHttp = function(){
        module.exports.attachHttp(server);
    }
    if(cb){
        server.on("passedConnection",cb);
    }
    
    server._listen = server.listen;
    server.listen = function(portOrPath){
        if(typeof portOrPath == "string"){
            portOrPath = pt.resolve(__dirname,"../sockets/",md5(portOrPath));
        }
        server._listen(portOrPath);

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

module.exports.send = function(portOrPath,socket,data){
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
		req.on("end",function(){
			continueSend();
		});
    }else{
		setTimeout(continueSend,0);
	}
	socket.pause();
	
	function continueSend(){		
		data = data?data:{};
		
		if(typeof portOrPath == "string"){
			portOrPath = pt.resolve(__dirname,"../sockets/",md5(portOrPath));
		}
		

		
		var c = net.connect(portOrPath,function(){
			ancillary.Send(ancillary.GetFD(c._handle),ancillary.GetFD(socket._handle));
			c.write(JSON.stringify(data));
			c.destroySoon();
		});
		c.on("close",function(){
			//socket.destroy();
		});
		c.on("error",function(){});
	}

}