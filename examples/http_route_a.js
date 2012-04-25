var http = require("http");
var anc = require("ancillary");

var server = anc.createHttpServer(function(req,res){
    res.end("A: "+req.url);
}).listen("/ancillary/a");