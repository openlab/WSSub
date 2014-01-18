//require('newrelic');
var http = require('http'),
  path = require('path'),
  util = require('util'),
  config = require('./config'),
  server = require('http').createServer(app),
  azure = require('azure'),
  WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port:process.env.PORT});

var serviceBusService = azure.createServiceBusService(config.sbConnectionString);

wss.on('connection', function(ws) {
  ws.send("Welcome");
});

function getMessage() {
    serviceBusService.receiveSubscriptionMessage(config.sbTopic, config.sbSubscription, function(error, receivedMessage) {
      if(!error) {
         ws.send(Buffer(receivedMessage.body));
      } else {
        console.log("Error recieving message: " + error);
      }
      getMessage();
    });
}

getMessage();
