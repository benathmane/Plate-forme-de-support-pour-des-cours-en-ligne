var fs = require('fs');
var express = require('express');
var static  = require('node-static');
var easyrtc = require("easyrtc");
var routes = require('./routes');   
var app = express();
var http    = require("http");              
var express = require("express");           
var io      = require("socket.io");         
var bodyParser = require('body-parser');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
CollectionDriver = require('./collectionDriver').CollectionDriver;
var mongoHost = 'localHost';
var mongoPort = 27017; 
var collectionDriver;
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); 
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
var htmlDir="/static";
app.set('port', process.env.PORT || 8088);

app.use(express.cookieParser());

app.use(express.session({secret: '1234567890QWERTY'}));

var session = require('client-sessions');
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


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
		io.sockets.emit('updatechat', socket.username, data);
	});

	socket.on('adduser', function(username){
		socket.username = username;
		socket.emit()
		usernames[username] = username;
		socket.emit('updatechat', 'SERVER', 'you have connected');
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		io.sockets.emit('updateusers', usernames);
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
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

// MongoDB connection configuration
var db = process.env.MONGO_DATABASE || 'MyDatabase';
//OPEN Connection to MongoDB
mongoClient.open(function(err, mongoClient) { 
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); 
  }
    var db = mongoClient.db("MyDatabase");  

    // ADD TEST DATA
    collectionDriver = new CollectionDriver(db); 

    var nbexistant=0;
    collectionDriver.findAll("Users", function(error, objs) { 
      nbexistant=objs.length;
       
    
    
    if(nbexistant==0){
      console.log("DB empty ==> add bootstrap data");
    var obj1={ "Identifiant":"AHMED", 
    "name" : "AHMED",
    "email": "ahmed@polytech.com",
    "password": "AHMED",
    "phone" : "+33 06",
    "month" : 10,
     "day" :3,
    "year" : 1966,
    "rooms" : [ "WEB"]};
    collectionDriver.save("Users",obj1 , function(err,docs) {
           if (err) console.log("error add test data");
          
    });
    var obj2={ "Identifiant":"AYOUB",  "name" : "AYOUB",
    "email": "ayoub@polytech.com",
    "password": "AYOUB",
    "phone" : "+33 06",
    "month" : 10,
     "day" :3,
    "year" : 1966,
    "rooms" : [ "WEB"]};
    collectionDriver.save("Users",obj2 , function(err,docs) {
           if (err) console.log("error add test data");
          
    });
    var obj3={ "Identifiant":"MOLKA",  "name" : "MOLKA",
    "email": "MOLKA@polytech.com",
    "password": "MOLKA",
    "phone" : "+33 06",
    "month" : 10,
     "day" :3,
    "year" : 1966,
    "rooms" : [ "WEB"]};
    collectionDriver.save("Users",obj3 , function(err,docs) {
           if (err) console.log("error add test data");
          
    });
    var obj3={ "Identifiant":"HANA",  "name" : "HANA",
    "email": "HANA@polytech.com",
    "password": "HANA",
    "phone" : "+33 06",
    "month" : 10,
     "day" :3,
    "year" : 1966,
    "rooms" : [ "WEB"]};
    collectionDriver.save("Users",obj3 , function(err,docs) {
           if (err) console.log("error add test data");
         
    });
    var room={
    "name" : "WEB",
    "connectedUser" : 0,
    "autorizedUsers" : [ "AHMED", "AYOUB", "MOLKA", "HANA"]
    };
    collectionDriver.save("Rooms",room , function(err,docs) {
           if (err) console.log("error add test data");
          
    });
    }
    });


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

   req.session.identifiant=null;
   if(name!=undefined){
     app.set('identifiant',name);
      var log={name: name, room: nameR};
	   collectionDriver.save('Logs', log, function(err,docs) {
          console.log("log sauvgardé");
     });
      userconnectd=name;

       collectionDriver.updateRoomConnectedUSer("Rooms", nameR ,function(error, objs) { 
         console.log("Room count conne");
      } );
   
	res.sendfile(__dirname + '/'+htmlDir+'/roomindex.html',{identifiant: ''+name});

  }
  else{
    res.status(404).render('404', { title: 'File not Found'});
  }
});


app.get('/logout', function (req, res) {
  userconnectd=null;
  req.session.identifiant=null;
  res.sendfile(__dirname + '/'+htmlDir+'/'+'index.html');
});

app.get('/getConnectedUser', function(req, res) { 
    res.send(''+userconnectd);
   
});

app.get('/clearConnectedUser', function(req, res) { 
       userconnectd=null;
      console.log("clear connected user ");
   
});


//REST API
app.get('/:collection/:entity', function(req, res) { 
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   console.log (entity);
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { 
          if (error) { res.send(400, error); }
          else { res.send(200, objs); 
		 
		  } 
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.get('/user/:name/:password', function(req, res) { 
   var params = req.params;
  
   var name = params.name;
   var password = params.password;
   collectionDriver.getUserByNamePassword("Users", name ,password, function(error, objs) { 
   
   if (error) { 
          res.send(400, error);
     }
     else {  
      if (JSON.stringify(objs) === '[]') {
          res.send(400, error);
       }else{         
          res.send(212, error);
       }
           
            
          } 
       });
   
});

app.get('/:collection', function(req, res) { 
   var params = req.params; 
  if(req.param('nom')!=undefined) req.session.identifiant = req.param('nom');

 if (req.params.collection=="Rooms"){
  console.log("entree Room");
   collectionDriver.getUsersRooms("Rooms",req.session.identifiant, function(error, objs) {
         if (error) { res.send(400, error); } 
	      else { 
	          if (req.accepts('html')) { 
    	          res.render('data',{objects: objs, collection: req.params.collection}); 
              } else {
	          res.set('Content-Type','httpApplication/json'); 
                  res.send(200, objs); 
              }
         }
    });
 }
   collectionDriver.findAll(req.params.collection, function(error, objs) { 
    	  if (error) { res.send(400, error); } 
	      else { 
	          if (req.accepts('html')) { 
    	          res.render('data',{objects: objs, collection: req.params.collection}); 
              } else {
	          res.set('Content-Type','httpApplication/json'); 
                  res.send(200, objs); 
              }
         }
   	});
});

app.post('/:collection', function(req, res) { 
    var object = req.body;
    var collection = req.params.collection;
	console.log(collection);
	console.log(object);
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } 
     });
});
 
 app.put('/Users/update/:creterea/:query', function(req, res) { 
    var creterea = req.params.creterea;
     var query = req.params.query;
    var collection = req.params.collection;
    
    collectionDriver.updateUserRoom("Users", creterea,query, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } 
     });
});

app.put('/Rooms/update/:creterea/:query', function(req, res) { 
    var creterea = req.params.creterea;
     var query = req.params.query;
    var collection = req.params.collection;
    
    collectionDriver.updateRoomUser("Rooms", creterea,query, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } 
     });
});
app.get('/get/All/Users', function(req, res) { 
   var params = req.params; 
   collectionDriver.getAllUsers("Users", function(error, objs) { 
        if (error) { res.send(400, error); } 
        else {
           res.set('Content-Type','Application/json'); 
                  res.send(JSON.stringify(objs));
            }
         
    });
});



app.post('/update/leave/Room/ConnectedUSer/:roomid', function(req, res) { 
     var roomid = req.params.roomid;
   

    collectionDriver.updateleaveRoomConnectedUSer("Rooms", roomid, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); }
     });
});