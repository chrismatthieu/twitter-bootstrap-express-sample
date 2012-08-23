var request = require('request');
var express = require('express');
var app = express();
  
// middleware
app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser()); 
  app.use(express.session({ secret: 'secret key' })); 
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

var http = require('http')
  , server = http.createServer(app);
   
var port = process.env.PORT || 4567;

var clientid = ''
var clientsecret = ''
var callbackurl = ''

app.get('/', function(req, res){
  res.render('index.html');
});

app.get('/login', function(req, res){
  res.redirect('https://bechtel.my.salesforce.com/services/oauth2/authorize?response_type=code&client_id=' + clientid + '&type=web_server&redirect_uri=' + callbackurl);
});

app.get('/callback', function(req, res){
  
  request.post({
          headers: {'content-type' : 'application/x-www-form-urlencoded'},
          url: 'https://bechtel.my.salesforce.com/services/oauth2/token',
           body: "code=" + req.param('code', null) + "&grant_type=authorization_code&client_id=" + clientid + "&client_secret=" + clientsecret + "&redirect_uri=" + callbackurl
           }, function(error, response, body){

            // body = {"id":"https://login.salesforce.com/id/00D80000000PMYXEA4/00580000003ZS4JAAW","issued_at":"1345736848804","scope":"id api refresh_token","instance_url":"https://bechtel.my.salesforce.com","refresh_token":"5Aep861QT4b0TO85TMT89gj2tm2WKPgzwKc7Ykfu9WtAX2ChDPyOv5l6bDQzQecDT2OFlzQoGJgaA==","signature":"Vwu5vkB7SA92XGUFomkh/tIBmb5s73hsvBC2Z/MCa4M=","access_token":"00D80000000PMYX!ARIAQFoQ9HzB6_9mO8gpMN2lCpE1HP9pjaY5wLdv1KQZil7OQQWA6_2r4JR58FIHF7Q.XvDLQCigffLjx2zP7jk7b1tXIe.a"}
            var bodyjson = JSON.parse(body)
            req.session.token = bodyjson.access_token;
            // res.send('Your token is ' + req.session.token);

            // res.render('index.html');
            res.sendfile(__dirname + '/public/index.html');


        // res.send(body);
      });
  
});

app.post('/chatter', function(req, res){
  // To post a Chatter message to a group, click on a group and save the last part of the URL following g= (i.e. https://bechtel.my.salesforce.com/_ui/core/chatter/groups/GroupProfilePage?g=0F980000000PDpg) and then use this group id along with your access_token to curl or post via your favorite language like this:
  // curl -X POST https://bechtel.my.salesforce.com/services/data/v25.0/chatter/feeds/record/0F980000000PDpg/feed-items -H 'Authorization: Bearer 00D...unKs' -d 'text=This is a test post via the Chatter API'
  // request.post(url)

  request(
    { method: 'POST'
    , uri: 'https://bechtel.my.salesforce.com/services/data/v25.0/chatter/feeds/record/0F980000000PDpg/feed-items'
    , headers: {
      'content-type': 'application/x-www-form-urlencoded'
      , 'Authorization': 'Bearer ' + req.session.token
    }
    , body: 'text=' + req.body.status  
    // , body: 'text=second post from live'  
    }
  , function (error, response, body) {
      if(response.statusCode == 201){
        console.log('successful post to chatter');
        var bodyjson = JSON.parse(body)
        res.send('<div class="well" style="margin-bottom: 0px;"><img src="' + bodyjson.actor.photo.smallPhotoUrl + '" style="width:50px;height:50px">' + bodyjson.body.text + '</div>');
      } else {
        console.log('error: '+ response.statusCode);
        console.log(body);
        res.send('error');
      }
    }
  )

  // res.render('index.html');
  // res.sendfile(__dirname + '/public/index.html');

  // <div class="well" style="margin-bottom: 0px;">
  //   <img src="https://twimg0-a.akamaihd.net/profile_images/918916153/SuperChrisSmall.jpg" style="width:50px;height:50px">
  //   This is timeline update 1
  // </div>


});

server.listen(port, function(){
  console.log("Express server listening on port " + port);
});
