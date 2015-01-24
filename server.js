var static  = require('node-static');
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var io      = require("socket.io");         // web socket external module
var easyrtc = require("easyrtc");  
var bodyParser = require('body-parser');
path = require('path');
var httpApp = express();         // EasyRTC external module

/*var file = new(static.Server)();
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(2015);
*/
var port = process.env.PORT ||2015;
var host = process.env.HOST || "127.0.0.1";

var app = http.createServer(httpApp).listen(port, host, function() {
  console.log("Server listening to %s:%d within %s environment",
              host, port, httpApp.get('env'));
});
// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(app, {"log level":1});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);
/*
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());*/
httpApp.use(express.static(__dirname + '/'));

httpApp.use(bodyParser.urlencoded({
    extended: true
}));
httpApp.use(bodyParser.json());

MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,

CollectionDriver = require('./collectionDriver').CollectionDriver;

/* This will allow Cozy to run your app smoothly but
 it won't break other execution environment */
var port = process.env.PORT ||2015;
var host = process.env.HOST || "127.0.0.1";


httpApp.set('views', path.join(__dirname, 'views'));
httpApp.set('view engine', 'jade');

var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B

mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
});

// Starts the server itself

var htmlDir="/pages";
// At the root of your website, we show the index.html page
httpApp.get('/', function(req, res) {
   console.log ('root');
   res.sendfile(__dirname + '/'+htmlDir+'/Acceuil.html');
});

httpApp.get('/register', function (req, res) {
  res.sendfile(__dirname + '/'+htmlDir+'/register.html');
});

httpApp.get('/createroom', function (req, res) {
  res.sendfile(__dirname + '/'+htmlDir+'/createroom.html');
  consol.log("test");
});


httpApp.get('/index', function (req, res) {
  console.log ('index');
  res.sendfile(__dirname + '/'+htmlDir+'/index.html');
});

httpApp.get('/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   console.log (entity);
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { //res.send(200, objs); 
		  res.redirect('/index');
		  } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

httpApp.get('/:collection', function(req, res) { //A
   var params = req.params; //B
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
	          if (req.accepts('html')) { //E
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F
              } else {
	          res.set('Content-Type','httpApplication/json'); //G
                  res.send(200, objs); //H
              }
         }
   	});
});
httpApp.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
	console.log(collection);
	console.log(object);
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});
 
 httpApp.put('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});
