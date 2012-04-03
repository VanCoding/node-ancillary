var ancillary = require("../build/Release/ancillary");
var net = require("net");
var http = require("http");


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
            var socket = new net.Socket(fd);        
            socket.readable = socket.writable = true;
            server.emit("passedConnection",socket,JSON.parse(new Buffer(data,"binary")+""));
            socket.resume();
            c.destroy();
        });       
    });
}

module.exports.attachHttp = function(server){
    server.on("passedConnection",function(c,data){
        http._connectionListener.call(server,c);
        c.ondata(new Buffer(data,"binary"),0,data.length);
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
    return server;
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
    }
    

    socket.pause();
    data = data?data:{};
    var c = net.connect(portOrPath,function(){
        ancillary.Send(ancillary.GetFD(c._handle),ancillary.GetFD(socket._handle));
        c.end(JSON.stringify(data));
    });

}