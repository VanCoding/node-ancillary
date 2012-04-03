var http = require("http");
var anc = require("ancillary");
var cp = require("child_process");

http.createServer(function(req,res){
    req.connection.pause();
    
    if(req.url.indexOf("/a/") == 0){
        anc.send("/ancillary/a",req);
    }else if(req.url.indexOf("/b/") == 0){
        anc.send("/ancillary/b",req);
    }else{
        res.end("<a href='/a/myfile.pdf'>Route A</a><br><a href='/b/myservice'>Route B</a>");
    }
    
    
}).listen(1234);

cp.fork(__dirname+"/http_route_a.js");
cp.fork(__dirname+"/http_route_b.js");
