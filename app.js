//require('newrelic');
var express = require('express'),
  http = require('http'),
  path = require('path'),
  hogan = require('hogan-express'),
  util = require('util'),
  app = express(),
  config = require('./config'),
  server = require('http').createServer(app),
  azure = require('azure'),
  WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port:9999});

var serviceBusService = azure.createServiceBusService(config.sbConnectionString);

var currentSockets = [];

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.engine('mustache', hogan);
  app.set('view engine', 'mustache');
  app.set('layout', __dirname + '/views/layout');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// Handle 'connection' events
wss.on('connection', function(ws) {
  ws.send("Welcome");
});

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
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
