var http = require("http");
var anc = require("ancillary");

var server = anc.createHttpServer(function(req,res){
    res.end("B: "+req.url);
}).listen("/ancillary/b");