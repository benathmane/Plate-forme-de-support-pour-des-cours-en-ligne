 var displayCoords, myAddress; 
  
       function getLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
          } else {
          displayCoords.innerHTML="Geolocation API not supported by your browser.";
       }
     }
  
  
      // Called when position is available
    function showPosition(position) {
        /*displayCoords.innerHTML="Latitude: " + position.coords.latitude + 
            "<br />Longitude: " + position.coords.longitude;    */
        showOnGoogleMap(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
 
    }
 
       var geocoder;
      var map;
      var infowindow = new google.maps.InfoWindow();
      var marker;
      
      function initialize() {
        displayCoords=document.getElementById("msg");
        myAddress = document.getElementById("address");
        
        geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(43.6157727, 7.072317900000001);
        var mapOptions = {
          zoom: 8,
          center: latlng,
          mapTypeId: 'roadmap'
        }
        map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions); 
      }
 
    function showOnGoogleMap(latlng) {
 
        geocoder.geocode({'latLng': latlng}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              map.setZoom(11);
              marker = new google.maps.Marker({
                  position: latlng,
                  map: map
              });
              infowindow.setContent(results[1].formatted_address);
              infowindow.open(map, marker);
              
              // Display address as text in the page
              myAddress.innerHTML="Adress: " + results[1].formatted_address;
            } else {
              alert('No results found');
            }
          } else {
            alert('Geocoder failed due to: ' + status);
          }
        });
      }     