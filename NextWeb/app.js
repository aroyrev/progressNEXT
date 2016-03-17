
/**
 * Module dependencies.
 */

var settings = {

};

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



app.get('/', routes.index);

var api = require('./routes/api')(app);

// app.post('/api/qrcode', api.generateQRCode);
// app.get('/api/qrcode', api.QRCode);
// app.get('/api/vcard', api.vCard);
// app.get('/api/tweets', api.tweets);
// app.get('/api/session', api.session);
// app.post('/api/import', api.import);
// // app.del('/api/clear', api.clear);
// app.post('/api/webhook', api.webhook);
// app.post ('/api/notification', api.notification);
// app.post('/api/attendee', api.attendee);
///app.post('/api/track', api.trackevent);


var  server = http.createServer(app);

var util = require('util');
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));

  var WebSocketClient = require('websocket').client;

  var client = new WebSocketClient();

  var buffer = new Buffer(util.format("%s:%s", 'progresscreator@amtech.mx/progressnext2016', 'Test1234'));

  var auth = util.format("Basic %s", buffer.toString('base64'));
  var uri = util.format("wss://dap.amtech.mx/amtech/push/notifications?clientid=NextLive-%s",new Date().getUTCMilliseconds());

  // amtech websocket Initializization.
  // client.connect(uri, null, null, {
  //     "Authorization" : auth
  // });

  /*

  {"creationDate":"2016-01-29T20:48:55.084+00:00","body":"Attendee urn:epc:tag:grai:0606353.00004.1308 exit from room /amtech/things/entities/usa:lasVegas:fourSeasons:level2:AccaciaBR1","guestusers":[],"_tenant":"progressnext2016","thinguri":"/amtech/things/entities/urn:epc:tag:grai:0606353.00004.1308","recipients":[null],"description":"","guesttenants":["progressnext2016"],"subject":"Attendee urn:epc:tag:grai:0606353.00004.1308 exit from room /amtech/things/entities/usa:lasVegas:fourSeasons:level2:AccaciaBR1","@type":"/amtech/activities/progressNext2016/notifications/AttendeeExit","_resourcestatus":"valid","_name":"1607c3393c8e4a55aa6edaadef4c3a4a","@id":"/amtech/notifications/instances/1607c3393c8e4a55aa6edaadef4c3a4a","_user":"progresscreator@amtech.mx"}

  */

  client.on('connect', function(connection) {
      var request = require('request');
      var uri = util.format('http://%s/api/track','localhost:3000');

      app.socket = require('socket.io')(server);

      connection.on('error', function(error) {
          console.log("Connection Error: " + error.toString());
      });
      connection.on('message', function(message) {
          if (message.type === 'utf8'){
              var data = message.utf8Data;
              var json = JSON.parse(data);

              request.post({
                  uri : uri,
                  body : {
                    info : json.body
                  },
                  json : true
              });
          }
      });

      connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
      });

     process.on('SIGINT', function () {
      console.log("Closing connection");
      connection.close();
     });
  });

  client.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
  });
});
