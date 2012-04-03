var ancillary = require("../build/Release/ancillary");
var net = require("net");


module.exports.attach = function(server){
    server.on("connection",function(c){
        var fd = -1;
        while(fd < 0){
            fd = ancillary.Receive(ancillary.GetFD(c._handle));
        }
        var socket = new net.Socket(fd);        
        socket.readable = socket.writable = true;
        server.emit("passedConnection",socket);
        socket.resume();
        c.destroy();
    });
}

module.exports.createServer = function(cb){
    var server = net.createServer();
    module.exports.attach(server);
    if(cb){
        server.on("passedConnection",cb);
    }
    return server;
}
module.exports.send = function(portOrPath,socket){
    socket.pause();
    var c = net.connect(portOrPath,function(){
        ancillary.Send(ancillary.GetFD(c._handle),ancillary.GetFD(socket._handle));
    });
}