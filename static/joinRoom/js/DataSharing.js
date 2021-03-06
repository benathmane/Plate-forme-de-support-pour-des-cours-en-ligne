
var selfEasyrtcid = "";
var peers = {};
var connectCount = 0;
var maxCALLERS = 3;

function connectData(roomName) {
	  easyrtc.enableDataChannels(true);
	easyrtc.setVideoDims(800,600);
  easyrtc.easyApp("easyrtc.webProject", "selfVideo", ["callerVideo1","callerVideo2","callerVideo3"],  loginSuccess,loginFailure);

    easyrtc.joinRoom(roomName, null, loginSuccess,loginFailure);
     easyrtc.setRoomOccupantListener(convertListToButtons);

    
    easyrtc.setDisconnectListener( function() {
        easyrtc.showError("LOST-CONNECTION", "Lost connection to signaling server");
    });
   easyrtc.dontAddCloseButtons(true);

    easyrtc.setOnCall( function(easyrtcid, slot) {
       convertListToButtons(roomName,easyrtc.getRoomOccupantsAsArray(roomName),null);
        console.log("getConnection count="  + easyrtc.getConnectionCount() );
    });
	
	
   
    easyrtc.setAcceptChecker(function(easyrtcid, responsefn) {
        responsefn(true);
        //document.getElementById("connectbutton_" + easyrtcid).style.visibility = "hidden";
    });

    easyrtc.setDataChannelOpenListener(function(easyrtcid, usesPeer) {
        var obj = document.getElementById(buildDragNDropName(easyrtcid));
        if (!obj) {
            console.log("no such object ");
        }
        jQuery(obj).addClass("connected");
        jQuery(obj).removeClass("notConnected");
    });
	
    easyrtc.setDataChannelCloseListener(function(easyrtcid) {
        //jQuery(buildDragNDropName(easyrtcid)).addClass("notConnected");
       // jQuery(buildDragNDropName(easyrtcid)).removeClass("connected");
    });
	

}


function removeIfPresent(parent, childname) {
    var item = document.getElementById(childname);
    if (item) {
        parent.removeChild(item);
    }
    else {
        console.log("didn't see item " + childname + " for delete eh");
    }
}

function deconect(roomName){

    easyrtc.leaveRoom(roomName, leaveSuccess(selfEasyrtcid,roomName), leaveFailure);

    

    
}

function convertListToButtons(roomName, occupants, isPrimary) {
	
	console.log("roomName="  + roomName );
    console.log("selfEasyrtcid="  + selfEasyrtcid );
    console.log("+++++++++++++occupant={"+easyrtc.getRoomOccupantsAsArray(roomName) +"}");
	
	
    var peerZone = document.getElementById('peerZone');
   
    for (var oldPeer in  peers) {
        if (!occupants[oldPeer]) {
            removeIfPresent(peerZone, buildPeerBlockName(oldPeer));
            delete peers[oldPeer];
        }
    }
    
    var i=0;
   
    for (var easyrtcid in occupants) {
        

        var name=occupants[easyrtcid];
        var tmp;
        if (typeof name === "object") tmp=name.easyrtcid;
        else tmp=name;
        if (!peers[tmp]) {
            if(tmp!= selfEasyrtcid){
            var peerBlock = document.createElement("div");
            peerBlock.id = buildPeerBlockName(tmp);
            peerBlock.className = "peerblock";
            peerBlock.appendChild(document.createTextNode(" For peer " + tmp));
            peerBlock.appendChild(document.createElement("br"));
            peerBlock.appendChild(buildDropDiv(tmp));
            peerBlock.appendChild(buildReceiveDiv(tmp));
            peerZone.appendChild(peerBlock);
            peers[tmp] = true;
            }
        }
    }
	
}



function buildDropDiv(easyrtcid) {
        var statusDiv = document.createElement("div");
        statusDiv.className = "dragndropStatus";

        var dropArea = document.createElement("div");
        var connectButton = document.createElement("button");
        connectButton.appendChild(document.createTextNode("Open Camera & Share"));
        connectButton.className = "connectButton";
        connectButton.id = "connectbutton_" + easyrtcid;
        easyrtc.setRoomOccupantListener(null); // so we're only called once.

        connectButton.onclick = function() {
            statusDiv.innerHTML = "Waiting for connection to be established";
            
            easyrtc.call(easyrtcid,
                    function(caller, mediatype) {
                        statusDiv.innerHTML = "Connection established";
                        dropArea.className = "dragndrop connected";
                        connectButton.style.visibility = "hidden";
                    },
                    function(errorCode, errorText) {
                        dropArea.className = "dragndrop connected";
                        statusDiv.innerHTML = "Connection failed";
                        connectButton.style.visibility = "hidden";
                        noDCs[easyrtcid] = true;
                    },
                    function wasAccepted(yup) {
                    }
            );
        }

        dropArea.id = buildDragNDropName(easyrtcid);
        dropArea.className = "dragndrop notConnected";
        dropArea.innerHTML = "File drop area";


        function updateStatusDiv(state) {
            switch (state.status) {
                case "waiting":
                    statusDiv.innerHTML = "waiting for other party<br\>to accept transmission";
                    break;
                case "started_file":
                    statusDiv.innerHTML = "started file: " + state.name;
                case "working":
                    statusDiv.innerHTML = state.name + ":" + state.position + "/" + state.size + "(" + state.numFiles + " files)";
                    break;
                case "cancelled":
                    statusDiv.innerHTML = "cancelled";
                    setTimeout(function() {
                        statusDiv.innerHTML = "";
                    }, 2000);
                    break;
                case "done":
                    statusDiv.innerHTML = "done";
                    setTimeout(function() {
                        statusDiv.innerHTML = "";
                    }, 3000);
                    break;
            }
            return true;
        }

        var noDCs = {}; 

        var fileSender = null;
        function filesHandler(files) {
             var timer = null;
            if (easyrtc.getConnectStatus(easyrtcid) === easyrtc.NOT_CONNECTED && noDCs[easyrtcid] === undefined) {
      
            }
            else if (easyrtc.getConnectStatus(easyrtcid) === easyrtc.IS_CONNECTED || noDCs[easyrtcid]) {
                if (!fileSender) {
                    fileSender = easyrtc_ft.buildFileSender(easyrtcid, updateStatusDiv);
                }
                fileSender(files, true);
            }
            else {
                easyrtc.showError("user-error", "Wait for the connection to complete before adding more files!");
            }
        }
        easyrtc_ft.buildDragNDropRegion(dropArea, filesHandler);
        var container = document.createElement("div");
        container.appendChild(connectButton);
        container.appendChild(dropArea);
        container.appendChild(statusDiv);
        return container;
}


function buildReceiveDiv(i) {
        var div = document.createElement("div");
        div.id = buildReceiveAreaName(i);
        div.className = "receiveBlock";
        div.style.display = "none";
        return div;
    }

function acceptRejectCB(otherGuy, fileNameList, wasAccepted) {

    var receiveBlock = document.getElementById(buildReceiveAreaName(otherGuy));
    jQuery(receiveBlock).empty();
    receiveBlock.style.display = "inline-block";

    receiveBlock.appendChild(document.createTextNode("Files offered"));
    receiveBlock.appendChild(document.createElement("br"));
    for (var i = 0; i < fileNameList.length; i++) {
        receiveBlock.appendChild(
                document.createTextNode("  " + fileNameList[i].name + "(" + fileNameList[i].size + " bytes)"));
        receiveBlock.appendChild(document.createElement("br"));
    }
     var button = document.createElement("button");
    button.appendChild(document.createTextNode("Accept"));
    button.onclick = function() {
        jQuery(receiveBlock).empty();
        wasAccepted(true);
    };
    receiveBlock.appendChild(button);

    button = document.createElement("button");
    button.appendChild(document.createTextNode("Reject"));
    button.onclick = function() {
        wasAccepted(false);
        receiveBlock.style.display = "none";
    };
    receiveBlock.appendChild(button);
}


function receiveStatusCB(otherGuy, msg) {
    var receiveBlock = document.getElementById(buildReceiveAreaName(otherGuy));
    if( !receiveBlock) return;

    switch (msg.status) {
        case "started":
            break;
        case "eof":
            receiveBlock.innerHTML = "Finished file";
            break;
        case "done":
            receiveBlock.innerHTML = "Stopped because " +msg.reason;
            setTimeout(function() {
                receiveBlock.style.display = "none";
            }, 1000);
            break;
        case "started_file":
            receiveBlock.innerHTML = "Beginning receive of " + msg.name;
            break;
        case "progress":
            receiveBlock.innerHTML = msg.name + " " + msg.received + "/" + msg.size;
            break;
        default:
            console.log("strange file receive cb message = ", JSON.stringify(msg));
    }
    return true;
}

function blobAcceptor(otherGuy, blob, filename) {
    easyrtc_ft.saveAs(blob, filename);
}

function loginSuccess(easyrtcid) {
  
  document.getElementById("iam").innerHTML = "I am " + easyrtc.cleanId(easyrtcid);
	selfEasyrtcid=easyrtcid;
	
	$.ajax({
		url: "/Connections",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({rtcId: selfEasyrtcid}),
		success: function (data, textStatus, jqXHR) {
			console.log("connection stored in Mongo DB");
		},
		error: function (jqXHR, textStatus, errorThrown) {	
			console.log("connection stored in Mongo DB")		
		}
	});
	
    easyrtc_ft.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}

function leaveSuccess(easyrtcid,roomName) {

     console.log("leaveSuccess roomName="+roomName);
    $.ajax({
        url: "/update/leave/Room/ConnectedUSer/"+roomName,
        type: "POST",
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
            console.log("connected user --");
        },
        error: function (jqXHR, textStatus, errorThrown) {  
            console.log("error connected user --")        
        }
    });

       console.log(easyrtcid + " is leaving ");
}


function leaveFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();
    var successCB = function() {};
    var failureCB = function() {};
    easyrtc.call(otherEasyrtcid, successCB, failureCB);
}

function clearConnectList() {
    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}

function buildPeerBlockName(easyrtcid) {
    return "peerzone_" + easyrtcid;
}

function buildDragNDropName(easyrtcid) {
    return "dragndrop_" + easyrtcid;
}

function buildReceiveAreaName(easyrtcid) {
    return "receivearea_" + easyrtcid;
}
