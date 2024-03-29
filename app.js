var path = require('path'),
  util = require('util'),
  config = require('./config'),
  azure = require('azure'),
  http = require('http'),
  express = require('express'),
  app = express(),
  WebSocketServer = require('ws').Server;

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
//server.listen(process.env.PORT);
server.listen(9999);

var wss = new WebSocketServer({server: server});

var serviceBusService = azure.createServiceBusService(config.sbConnectionString);

wss.on('connection', function(ws) {
  console.log("New connection to WS");
  var loop = setInterval(function() {
    serviceBusService.receiveSubscriptionMessage(config.sbTopic, config.sbSubscription, function(error, receivedMessage) {
      if(!error) {
         ws.send(new Buffer(receivedMessage.body, "base64"));
      } else {
        console.log("Error: " + error);
      }
    });
  }, 500);
});
