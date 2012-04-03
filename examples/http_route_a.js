var http = require("http");
var anc = require("ancillary");

var server = anc.createServer();

server.on("request",function(req,res){
    res.end("A: "+req.url);
});
server.enableHttp();
server.listen("/ancillary/a");