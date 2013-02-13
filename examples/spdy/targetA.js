var anc = require("ancillary");

anc.createHttpServer(function(req,res){
    res.end("Welcome to A");
}).listen(__filename);