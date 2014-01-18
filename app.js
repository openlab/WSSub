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
server.listen(port:process.env.PORT);

var wss = new WebSocketServer({server: server});

var serviceBusService = azure.createServiceBusService(config.sbConnectionString);

wss.on('connection', function(ws) {
    serviceBusService.receiveSubscriptionMessage(config.sbTopic, config.sbSubscription, function(error, receivedMessage) {
      if(!error) {
         ws.send(Buffer(receivedMessage.body));
      } else {
        console.log("Error: " + error);
      }
    });
});
