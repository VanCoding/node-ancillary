anillary
=======================

This module for node.js allows you to send socket objects to other node.js
processes that are completely unrelated. The processes that exchange sockets
can be started seperately.

build
-----------------------
    node-waf configure
    node-waf build

Requiring
-----------------------
var ancillary = require("ancillary");


Listening for sockets
-----------------------

    ancillary.createServer(function(socket){
    
        //do read write action to the socket
    
    }).listen("/unix/socket/path/"); //you could also use a port number here



Sending Sockets
-----------------------

    ancillary.send("/unix/socket/path/",socket); //you can also use a port number here

'socket' is a Socket object gotten from the "connection" event of a tcp server.
                                             