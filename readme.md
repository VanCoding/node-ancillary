#anillary

This module for node.js allows you to send socket objects to other node.js
processes that are completely unrelated. The processes that exchange sockets
can be started seperately.

##build
    node-waf configure
    node-waf build

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
