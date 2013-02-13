var anc = require("ancillary");

//function to route our requests
function route(req,res){
    if(req.url.indexOf("/a/") == 0){
        
        //send requests beginning with /a/ to our target A
        anc.send(__dirname+"/targetA.js",req);
        
    }else if(req.url.indexOf("/b/") == 0){
        
        //send requests beginnging with /b/ to our target B
        anc.send(__dirname+"/targetB.js",req);
    }else{
        
        //handle the requsts directy otherwise
        res.end("<html><head></head><body>Please visit eiter <a href='/a/'>targetA</a> or <a href='/b/'>targetB</b></body></html>");
    }
}

//listen for incoming requests and route them using our route function
anc.createHttpServer(route).on("upgrade",route).listen(__filename);


