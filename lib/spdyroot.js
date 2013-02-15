var spdy = require("spdy");
var fs = require("fs");
var net = require("net");
var anc = require("./ancillary.js");
var httpjs = require("http.js");
var md5 = require("./md5.js");


module.exports = function(port,opts,target){   
    
    
    var serverpath = "/tmp/"+md5(__filename+":"+port);    
    
    try{
        fs.unlinkSync(serverpath);
    }catch(e){}
    
    var server = net.createServer({allowHalfOpen:true},function(c){
        anc.send(target,c);
    }).listen(serverpath);  
    
    
    var s = spdy.createServer(opts,handle);
    
    
    function handle(req,res){
    
        var c = net.connect(serverpath,function(){
            
            req.headers.connection = "Close";
            var header = req.method+" "+req.url+" HTTP/1.1\r\n";
            for(var h in req.headers){
                header += h+": "+req.headers[h]+"\r\n";
            }
            header += "\r\n";
            c.write(header);
            req.pipe(c);
            
            var res2 = new httpjs.httpParser(c,false);      
            
        	var open = false;
            res2.on("open",function(){
                open = true;
                res.writeHead(res2.statusCode,res2.statusMessage,res2.headers);
                res2.pipe(res);           
            });
            res2.on("close",function(){
                if(!open){
					res.writeHead(404,"Not found");
                    res.end();
                }
            });
        });
    }
    
    
    s.on("upgrade",function(req,sock,data){
        sock.on("data",function(d){
            req.emit("data",d);
        });
        sock.on("end",function(){
            req.emit("end");
        });
        var res = new httpjs.httpResponse(sock);
        handle(req,res);
    });
    
    
    s.listen(port);
}


