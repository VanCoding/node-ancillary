/*
this exmaple demonstrates how you can send a socket to another process as simply
as possible

simple_parent.js:
This program contains a tcp server that listens on port 7766. Every incoming
connection is immediately sent to the program simple_child.js over a unix
domain socket at path /ancillary. 

simple_child.js:
This program listens for sockets sent by simple_parent.js on a unix domain
socket at path /ancillary. All data on such incoming sockets is immediately
written to the console.
*/

//load modules
var ancillary = require("ancillary");
var net = require("net");
var cp = require("child_process");

//start simple_child.js
cp.fork(__dirname+"/simple_child.js");

//start tcp server & send all incoming connections to simple_child.js
net.createServer(function(c){    
    ancillary.send("/ancillary/simple",c);
}).listen(7766);

//wait 1 second, then emulate an incoming connection to our tcp server
//send a message to the connection every second & log all incoming data
//from the child
setTimeout(function(){
    var c = net.connect(7766,function(){
        setInterval(function(){
            c.write("parent: hello child");
        },1000);
        c.on("data",function(d){
            console.log(d+"");
        });        
    });
},1000);
