var anc = require("ancillary");
var ws = require("ws");


var wss = new ws.Server({noServer:true});

//function to route our requests
function route(req,res,data){
    console.log("got request");
    
    if(req.upgrade){
        
        //handle the upgrade request
        
        wss.handleUpgrade(req,res,data,function(c){
			console.log("got connection");
			var i = 0;
            setInterval(function(){
                c.send((i++)+"");
            },1000);
        });
        
        
    }else{
        
        //send our client to the browser
        res.end([
            "<html>",
                "<head>",
                    "<script>",                    
                        "var ws = new WebSocket('wss://'+location.host);",
                        "ws.onopen=function(){",
                            "console.log('connected to server');",
							"setInterval(function(){",
								"ws.send('hello world!')",
							"},1000);",
                        "}",
                        "ws.onmessage=function(d){",
                            "console.log('got data from server: '+d.data);",
                        "}",
                    "</script>",
                "</head>",
                "<body>",
                    "Open your console and see what's going on",
                "</body>",
            "</html>"
        ].join("\r\n"));
    }
}

//listen for incoming requests and route them using our route function
anc.createHttpServer(route).on("upgrade",route).listen(__filename);


