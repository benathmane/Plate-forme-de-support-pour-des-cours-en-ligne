var fs = require('fs');
var express = require('express');
var static  = require('node-static');
var easyrtc = require("easyrtc");
var routes = require('./routes');   
var app = express();
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var io      = require("socket.io");         // web socket external module
var bodyParser = require('body-parser');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
CollectionDriver = require('./collectionDriver').CollectionDriver;
var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
/* app.use(bodyParser.urlencoded({ extended: true }));*/
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var htmlDir="/static";


app.use(express.cookieParser());

app.use(express.session({secret: '1234567890QWERTY'}));

var session = require('client-sessions');
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.configure(function () {
    var hourMs = 1000 * 60 * 60;
    app.use(express.static('static', {
        maxAge: hourMs
    }));
    app.use(express.directory('static'));
		app.use(express.directory('static/js'));
    app.use(express.errorHandler());
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.set('view options', { layout: false });
		app.use(express.methodOverride());
});

// Routes
app.get('/', routes.index);
app.get('/file-list', routes.getFileList);
app.post('/upload-file', routes.uploadFile);
app.get('/file/:id/:name', routes.getFile);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var rtc = easyrtc.listen(app, io);
server.listen(8088);
var channels = {};
var usernames = {};

var userconnectd;

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected) {
        io.isConnected = true;
    }

    socket.on('new-channel', function (data) {
        if (!channels[data.channel]) {
            initiatorChannel = data.channel;
        }
        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		socket.emit()
		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel) {
            delete channels[initiatorChannel];
        }
    });
	 socket.on('send:coords', function (data) {
        socket.broadcast.emit('load:coords', data, socket.username);
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender)
                socket.broadcast.emit('message', data.data);
        });
    });
}


//OPEN Connection to MongoDB
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
});



//ROUNTING 
app.get('/', function(req, res) {
   res.sendfile('index.html');
});

app.get('/register', function (req, res) {
  res.sendfile(__dirname + '/'+htmlDir+'/register.html');
});

app.get('/createroom', function (req, res) {
	res.sendfile(__dirname + '/'+htmlDir+'/createroom.html');
});

app.get('/joinRoom/:id', function (req, res) {
	
  var name = req.session.identifiant;
   var nameR = req.params.id;

  console.log(name);
  //console.log("*************==="+name)
  if(name!=undefined){

    //res.render('page', { title: 'Ninja Store - ' + name, username: req.session.username, content:contents[name] });
    /*
     var options = {
      headers: {
        'identifiant':name
        }
      };
      */
      app.set('identifiant',name);
      var log={name: name, room: nameR};
	   collectionDriver.save('Logs', log, function(err,docs) {
          console.log("logsauvgardé");
     });
      userconnectd=name;

       collectionDriver.updateRoomConnectedUSer("Rooms", nameR ,function(error, objs) { //J
         console.log("*******************************Room count conne");
      } );
   
	res.sendfile(__dirname + '/'+htmlDir+'/roomindex.html',{identifiant: ''+name});



  }
  else{
    //res.send(400, null);
    res.status(404).render('404', { title: 'File not Found'});
  }
});


app.get('/logout', function (req, res) {
  app.set('identifiant',null);
  userconnectd=null;
  res.sendfile(__dirname + '/'+htmlDir+'/'+'index.html');
});

app.get('/getConnectedUser', function(req, res) { //I
  
      res.send(''+userconnectd);
   
});

//REST API
app.get('/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   console.log (entity);
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { res.send(200, objs); 
		  //res.redirect('/index');
		  } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.get('/user/:name/:password', function(req, res) { //I
   var params = req.params;
  
   var name = params.name;
   var password = params.password;
   collectionDriver.getUserByNamePassword("Users", name ,password, function(error, objs) { //J
   
   if (error) { 
          res.send(400, error);
     }
     else {  
      if (JSON.stringify(objs) === '[]') {
          res.send(400, error);
       }else{
          // res.send(JSON.stringify(objs));
          res.send(212, error);
       }
           
            
          } 
       });
   
});

app.get('/:collection', function(req, res) { //A
   var params = req.params; //B
   //console.log("------------------"+req.params.nom);
   //console.log(req.param('nom'));
   //app.use(express.session({secret: '1234567890QWERTY'}));



    if(req.param('nom')!=undefined) req.session.identifiant = req.param('nom');

    

 if (req.params.collection=="Rooms"){
 console.log("entreeRoom");
 collectionDriver.getUsersRooms("Rooms",req.session.identifiant, function(error, objs) { //C
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
 }
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

app.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
	console.log(collection);
	console.log(object);
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});
 
 app.put('/Users/update/:creterea/:query', function(req, res) { //A
    var creterea = req.params.creterea;
     var query = req.params.query;
    var collection = req.params.collection;
    
    collectionDriver.updateUserRoom("Users", creterea,query, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});

app.put('/Rooms/update/:creterea/:query', function(req, res) { //A
    var creterea = req.params.creterea;
     var query = req.params.query;
    var collection = req.params.collection;
    
    collectionDriver.updateRoomUser("Rooms", creterea,query, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});
app.get('/get/All/Users', function(req, res) { //A
   var params = req.params; //B
   collectionDriver.getAllUsers("Users", function(error, objs) { //C
        if (error) { res.send(400, error); } //D
        else {
           res.set('Content-Type','Application/json'); //G
                  res.send(JSON.stringify(objs));
            }
         
    });
});




/*
Code to get rooms of the passed user ==> Not working


app.get('/get/All/User/Room/:iduser', function(req, res) { //A
   //var params = req.params; //B

console.log("--------------");

   collectionDriver.getUsersRooms("Users",req.params.iduser, function(error, objs) { //C
        if (error) { res.send(400, error); } //D
        else {
                console.log("-----qq---------");
                
                for( var i = 0; i < JSON.stringify(objs).length; i++) {
                  console.log(JSON.stringify(objs)[i]);
                }
         
                 res.send(JSON.stringify(objs));
            }
         
    });
});
*/
