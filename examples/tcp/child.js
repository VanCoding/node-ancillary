//load modules
var ancillary = require("../../index.js");
var net = require("net");

//create a server that listens for incoming sockets
//log all incoming data on those sockets
//initially, send a message to the socket
ancillary.createServer(function(c){
    console.log("connection");
    c.on("data",function(d){
        console.log(d+"");
    });
    c.write("child: hello parent");
}).listen(__filename);

