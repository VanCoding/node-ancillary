var http = require("http");
var anc = require("ancillary");

var server = anc.createServer();

server.on("request",function(req,res){
    res._last = true;
    res.end("B: "+req.url);
});
server.enableHttp();
server.listen("/ancillary/b");