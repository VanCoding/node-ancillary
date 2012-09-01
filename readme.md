#ancillary

This module for node.js allows you to send socket objects to other node.js
processes that are completely unrelated. The processes that exchange sockets
can be started seperately.

##build
    node-gyp configure
    node-gyp build

##Requiring

    var ancillary = require("ancillary");


#TCP

##Listening for sockets

    ancillary.createServer(function(socket){
    
        //do read write action to the socket
    
    }).listen("myuniqueID"); //a uniqe id for this server



##Sending Sockets

    ancillary.send("uniqueserverID",socket); //you can also use a port number here

'socket' is a Socket object gotten from the "connection" event of a tcp server.

#HTTP

##Listening for requests

    ancillary.createHttpServer(function(req,res){
    
        //handle request here
    
    }).listen("myuniqueID");

##Sending Requests

    ancillary.send("uniqueserverID",request);

'request' is a Request object gotten from the "request" event of a http server.


#WebSockets

Sending WebSockets is not directly supported by Ancillary, but you can easily do
it by yourself using the module "ws".

##Sending WebSockets

    var anc = require("ancillary");
    var http = require("http");
    var ws = require("ws");
    
    var s = http.createServer();
    s.listen(80);
    
    //the following is needed because we don't want our websocket server to write
    //to the socket
    s.on("upgrade",function(req,sock){
        sock.write = function(){}
    });
    
    new ws.Server({server:s}).on("connection",function(c){
        anc.send("uniqueserverID",c.upgradeReq);
    });


##Listening for WebSockets

    var anc = require("ancillary");
    var http = require("http");
    var ws = require("ws");
    
    var s = anc.createHttpServer();
    s.listen("uniqueserverID");
    
    new ws.Server({server:s}).on("connection",function(c){
    
        //handle connection here
    
    });
