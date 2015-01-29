var chat;
var socket;

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function myFunction() {
    var d = new Date();
    var x = document.getElementById("demo");
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());
    return h + ":" + m + ":" + s;
}

function chat(){
    this.initializeSocket=function(){

        socket = io.connect('/');


        // on connection to server, ask for user's name with an anonymous callback
        socket.on('connect', function(){
            // call the server-side function 'adduser' and send one parameter (value of prompt)
            socket.emit('adduser', prompt("What's your name?"));
            //charge la map
            $.getScript( "js/map.js" )
                .done(function( script, textStatus ) {
                    console.log( textStatus );
                })
                .fail(function( jqxhr, settings, exception ) {
                    $( "div.log" ).text( "Error." );
                });

        });

        // listener, whenever the server emits 'updatechat', this updates the chat body
        socket.on('updatechat', function (username, data) {
            $('#conversation').append('<div class="message" id="message_1" ><b>'+username + ' : ' + data+'  <span>('+myFunction()+')</span></b></div><br>');
						
            document.getElementById("conversation").scrollTop =document.getElementById("conversation").scrollHeight;
        });

        // listener, whenever the server emits 'updateusers', this updates the username list
        socket.on('updateusers', function(data) {
            $('#users').empty();
            $.each(data, function(key, value) {
                $('#users').append('<div>' + key + '</div>');
            });
        });

    }
    // on load of page
    this.loadPage=function(){
        $(function(){
            // when the client clicks SEND
            $('#datasend').click( function() {

                var message = $('#data').val();
                $('#data').val('');
                // tell server to execute 'sendchat' and send along one parameter
                socket.emit('sendchat', message);

                // document.getElementById("zone").scrollTop = document.getElementById("zone").scrollHeight - document.getElementById("zone").clientHeight;
                document.getElementById("conversation").scrollTop =document.getElementById("conversation").scrollHeight;
                $('#data').focus();

            });

            // when the client hits ENTER on their keyboard
            $('#data').keypress(function(e) {
                if(e.which == 13) {
                    $(this).blur();
                    $('#datasend').focus().click();
                    $('#data').focus();
                }
            });
        });
    }
}
