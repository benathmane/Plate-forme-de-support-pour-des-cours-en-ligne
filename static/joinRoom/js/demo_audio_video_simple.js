var selfEasyrtcid = "";
var connectCount = 0;
var maxCALLERS = 3;


function connectVideo(roomName) {
    easyrtc.setVideoDims(640,480);
    easyrtc.setRoomOccupantListener(callEverybodyElse(roomName));
	
 	easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo1","callerVideo2","callerVideo3"], 
        loginSuccess,loginFailure);
    easyrtc.setDisconnectListener( function() {
        easyrtc.showError("LOST-CONNECTION", "Lost connection to signaling server");
    });
   easyrtc.dontAddCloseButtons(true);

    easyrtc.setOnCall( function(easyrtcid, slot) {
        console.log("getConnection count="  + easyrtc.getConnectionCount() );
    });

}


function clearConnectList() {
    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}


function convertListToButtons (roomName, data, isPrimary) {
    clearConnectList();
    var otherClientDiv = document.getElementById('otherClients');
    for(var easyrtcid in data) {
        var button = document.createElement('button');
         button.onclick = function(easyrtcid) {
             return function() {
                 performCall(easyrtcid);
             };
        }(easyrtcid);

        var label = document.createTextNode(easyrtc.idToName(easyrtcid));
        button.appendChild(label);
        otherClientDiv.appendChild(button);
    }
}


function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();
    var successCB = function() {};
    var failureCB = function() {};
    easyrtc.call(otherEasyrtcid, successCB, failureCB);
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " + easyrtc.cleanId(easyrtcid);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}


function callEverybodyElse(roomName, otherPeople) {
    console.log("roomName="  + roomName );
    console.log("callEverybodyElse count="  + easyrtc.getConnectionCount() );
    easyrtc.setRoomOccupantListener(null); // so we're only called once.
    var list = [];
    var connectCount = 0;
    for(var easyrtcid in otherPeople ) {
        list.push(easyrtcid);
    }
    //
    // Connect in reverse order. Latter arriving people are more likely to have
    // empty slots.
    //
    function establishConnection(position) {
        function callSuccess() {
            connectCount++;
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        function callFailure(errorCode, errorText) {
            easyrtc.showError(errorCode, errorText);
            if( connectCount < maxCALLERS && position > 0) {
                establishConnection(position-1);
            }
        }
        easyrtc.call(list[position], callSuccess, callFailure);

    }
    if( list.length > 0) {
        establishConnection(list.length-1);
    }
}

    