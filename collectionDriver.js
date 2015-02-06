var ObjectID = require('mongodb').ObjectID;
CollectionDriver = function(db) {
  this.db = db;
};

CollectionDriver.prototype.getThis = function(callback) {
  callback(null, this);
};

CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};


CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { 
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) { 
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};
CollectionDriver.prototype.get = function(collectionName, id, callback) { 
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); 
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { 
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};


CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) { 
      if( error ) callback(error)
      else {
        obj.created_at = new Date(); 
        the_collection.insert(obj, function() { 
          callback(null, obj);
        });
      }
    });
};


CollectionDriver.prototype.updateUserRoom = function(collectionName, criterea,modif, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
     
	        the_collection.update(
          {"name" : criterea},
          {$push: { "rooms": modif } }
          , function(error,doc) { 
            	if (error) callback(error)  
              callback(null, "updated");          	
            });          
        }
    });
}

CollectionDriver.prototype.updateRoomUser = function(collectionName, criterea,modif, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
     
          the_collection.update(
          {"name" : criterea},
          {$push: { "autorizedUsers": modif } }
          , function(error,doc) { 
              if (error) callback(error)  
              callback(null, "room updated");            
            });          
        }
    });
}

CollectionDriver.prototype.updateRoomConnectedUSer = function(collectionName, criterea, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
        
          the_collection.update(
         {"_id" : ObjectID(criterea)},
          {$inc: { "connectedUser": 1 } }
          , function(error,doc) { 
              if (error) callback(error)  ;

              callback(null, "room updated");            
            }
            );          
        }
    });
}


CollectionDriver.prototype.updateleaveRoomConnectedUSer = function(collectionName, criterea, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
      
          the_collection.update(
          
          {"_id" : ObjectID(criterea)},
          {$inc: { "connectedUser": -1 } }
          , function(error,doc) { 
              if (error) callback(error)  ;

              callback(null, "room updated");            
            }
            );          
        }
    });
}


CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { 
        if (error) callback(error)
        else {
            the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { 
            	if (error) callback(error)
            	else callback(null, doc);
            });
        }
    });
}



  

CollectionDriver.prototype.getRoomResources = function(collectionName, roomId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { 
        if (error) callback(error)
        else {
            the_collection.find({'name':roomId}).toArray(function(error, results) { 
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};


CollectionDriver.prototype.getUserByNamePassword = function(collectionName, name,password, callback) { 
    
            this.getCollection(collectionName, function(error, the_collection) { 
        if (error) callback(error)
        else {
            the_collection.find({'name':name,'password':password}).toArray(function(error, results) { 
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });


};

CollectionDriver.prototype.getUserByName = function(collectionName, name, callback) {
    
            this.getCollection(collectionName, function(error, the_collection) { 
        if (error) callback(error)
        else {
            the_collection.find({'name':name}).toArray(function(error, results) { 
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });


};

CollectionDriver.prototype.getAllUsers = function(collectionName,callback) { 
    
        this.getCollection(collectionName, function(error, the_collection) { 
        if  (error) callback(error)
        else {
              the_collection.find().toArray(function(error, results) { 
              if( error ) callback(error);
              else {
                  callback("",results);
               }
          });
        }
    });


};

CollectionDriver.prototype.getUsersRooms = function(collectionName,userNom,callback) { 
    

        this.getCollection(collectionName, function(error, the_collection) {   
        if  (error) callback(error)
        else {
        
              the_collection.find({'autorizedUsers':userNom }).toArray(function(error, results) { 
                  
                if( error ){   console.log(error); callback(error);}
              else  {
			 
                callback(null,results);
               
              }
          });
        }
    });


};


  

exports.CollectionDriver = CollectionDriver;
