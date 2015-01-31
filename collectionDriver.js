var ObjectID = require('mongodb').ObjectID;
/*This function defines the CollectionDriver constructor method; it stores a MongoDB client instance for later use.*/
CollectionDriver = function(db) {
  this.db = db;
};

CollectionDriver.prototype.getThis = function(callback) {
  callback(null, this);
};

/*This section defines a helper method getCollection to obtain a Mongo collection by name. You define class methods by adding functions to prototype.*/
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};
//appele la collection en A et renvoie tous les objets trouvés en B
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) { //B
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};
//single item from a collection by its _id.
CollectionDriver.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};


//save new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error)
      else {
        obj.created_at = new Date(); //B
        the_collection.insert(obj, function() { //C
          callback(null, obj);
        });
      }
    });
};


//update a specific object
CollectionDriver.prototype.updateUserRoom = function(collectionName, criterea,modif, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
     
	        the_collection.update(
          {"name" : criterea},
          //{"_id" : ObjectID(criterea)},
          {$push: { "rooms": modif } }
          , function(error,doc) { //C
            	if (error) callback(error)  
              callback(null, "updated");          	
            });          
        }
    });
}

//update a specific object
CollectionDriver.prototype.updateRoomUser = function(collectionName, criterea,modif, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error)
        else {
     
          the_collection.update(
          {"nom" : criterea},
          //{"_id" : ObjectID(criterea)},
          {$push: { "autorizedUsers": modif } }
          , function(error,doc) { //C
              if (error) callback(error)  
              callback(null, "room updated");            
            });          
        }
    });
}
//delete a specific object
CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error)
        else {
            the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { //B
            	if (error) callback(error)
            	else callback(null, doc);
            });
        }
    });
}



  
 //get Room Resources
CollectionDriver.prototype.getRoomResources = function(collectionName, roomId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error)
        else {
            the_collection.find({'nom':roomId}).toArray(function(error, results) { //B
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

//single item from a collection by its _id.
CollectionDriver.prototype.getUserByNamePassword = function(collectionName, name,password, callback) { //A
    
            this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error)
        else {
            the_collection.find({'name':name,'password':password}).toArray(function(error, results) { //B
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });


};

//single item from a collection by its _id.
CollectionDriver.prototype.getAllUsers = function(collectionName,callback) { //A
    
        this.getCollection(collectionName, function(error, the_collection) { //A
        if  (error) callback(error)
        else {
              the_collection.find().toArray(function(error, results) { //B
              if( error ) callback(error);
              else {
                /*
                  var strJson = "{";
                  var intCount = results.length;
                  if(intCount > 0){
                    
                            for(var i=0; i<intCount;i++){
                                    strJson += '{"user":"' + results[i].nom + '"}'
                                    if (i<intCount-1){strJson+=',';}
                            }
                    
                  }
                  console.log(intCount);
                  strJson+='}';
                  console.log(strJson);

                  callback("",JSON.stringify(strJson));
                  */
                  callback("",results);
               }
          });
        }
    });


};



//recherche des rooms associé à un autorizedUsers
CollectionDriver.prototype.getUsersRooms = function(collectionName,userNom,callback) { //A
    

        this.getCollection(collectionName, function(error, the_collection) {   //A
        if  (error) callback(error)
        else {
        
              the_collection.find({'autorizedUsers':userNom }).toArray(function(error, results) { //B
                  
                if( error ){   console.log(error); callback(error);}
              else  {
			 
                callback(null,results);
               
              }
                 
              //}
          });
        }
    });


};


  

exports.CollectionDriver = CollectionDriver;
