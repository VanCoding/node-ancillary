var anc = require("ancillary");

anc.createHttpServer(function(req,res){
    res.end("Welcome to B");
}).listen(__filename);