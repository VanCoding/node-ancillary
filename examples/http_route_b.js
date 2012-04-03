var http = require("http");
var anc = require("ancillary");

var server = anc.createServer(function(c,data){
    http._connectionListener.call(server,c);
    c.ondata(new Buffer(data.header,"binary"),0,data.header.length);
});
server.on("request",function(req,res){
    res.end("B: "+req.url);
});
server.listen("/ancillary/b");