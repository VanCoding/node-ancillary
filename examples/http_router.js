var http = require("http");
var anc = require("ancillary");
var cp = require("child_process");

http.createServer(function(req,res){
    req.connection.pause();
    var d = req.method+" "+req.url+" HTTP/"+req.httpVersion+"\r\n";
    for(var h in req.headers){
        d+=h+": "+req.headers[h]+"\r\n";
    }
    d+= "\r\n";
    
    if(req.url.indexOf("/a/") == 0){
        anc.send("/ancillary/a",req.connection,{type:"HTTP",header:d});
    }else if(req.url.indexOf("/b/") == 0){
        anc.send("/ancillary/b",req.connection,{type:"HTTP",header:d});
    }else{
        res.end("<a href='/a/myfile.pdf'>Route A</a><br><a href='/b/myservice'>Route B</a>");
    }  
    
    
}).listen(1234);

cp.fork(__dirname+"/http_route_a.js");
cp.fork(__dirname+"/http_route_b.js");
