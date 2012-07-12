var net = require("net");
var http = require("http");
var anc = require("./index.js");

anc.createHttpServer(function(req,res){
    res.end("Hello World!");
}).listen("test");

http.createServer(function(req,res){
    anc.send("test",req);
}).listen(80);
