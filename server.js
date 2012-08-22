var express = require('express');
var app = express();
  
// middleware
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

var http = require('http')
  , server = http.createServer(app);
   
var port = process.env.PORT || 3000;

server.listen(port, function(){
  console.log("Express server listening on port " + port);
});
