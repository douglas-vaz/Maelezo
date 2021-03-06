/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , toobusy = require('toobusy');

//Get PORT from enbironment or set to 5000 as default
var port = process.env.PORT || 5000;

var app = express()
  , server = app.listen(port, function(){
    console.log("Server listening on PORT " + port);
  })
  , io = io.listen(server);


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  app.use(express.static(__dirname+'/public'));
  
    //Toobusy middleware
  app.use(function(req, res, next) {
  // check if we're toobusy() - note, this call is extremely fast, and returns
  // state that is cached at a fixed interval
  if (toobusy()) res.send(503, "I'm busy right now, sorry.");
  else next();
});
  
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

var debug = true;


//Socket.io configuration

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
/*io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
  io.set("close timeout", 10);
  io.set("log level", 1);
});
*/
  io.sockets.on('connection', function (socket) {

  if(debug) console.log("Connected");

  socket.emit('status', { connected: 'true'});

  //Canavs emits
  socket.on('updateView', function (data) {
    console.log(data);

    socket.broadcast.emit('viewUpdate',data);

  });
});


//Routes

app.get("/plus.png",function(req,res){
   res.sendfile(__dirname+"/views/plus.png");
});
app.get("/",function(req,res){
   res.sendfile(__dirname+"/public/yui.html");
});
  
app.get("/yuican.js",function(req,res){
   res.sendfile(__dirname+"/public/yuican.js");
});

app.get("/style.css",function(req,res){
   res.sendfile(__dirname+"/public/style.css");
});

app.get("/plus.png",function(req,res){
   res.sendfile(__dirname+"/views/plus.png");
});
app.get("/close.png",function(req,res){
   res.sendfile(__dirname+"/public/close.png");
});
