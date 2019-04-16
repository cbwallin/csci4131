function validateForm(e) {
  let alphanumericRegex = /^[\w\-\s]*$/;
  let {
    ename,
    loc
  } = document.forms["eventForm"];
  if (!ename.value.match(alphanumericRegex) || !loc.value.match(alphanumericRegex)) {
    alert("Event Name and Location must be alphanumeric.");
    return false;
  }
}

var markers = [];
var map;
var service;
var geocoder;
var infowindow;
var directionsService;
var directionsDisplay;
var uOfM = {
  lat: 44.9727,
  lng: -93.23540000009003
};

function initMap() {
  map = new google.maps.Map(
    document.getElementById('map'), {
      zoom: 14,
      center: uOfM
    });

  map.addListener('click', function (event) {
    geocodeLatLng(event.latLng);
  });

  geocoder = new google.maps.Geocoder();
  service = new google.maps.places.PlacesService(map);
  infowindow = new google.maps.InfoWindow();
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));
}

function geocodeLatLng(latlng) {
  clearMarker();
  geocoder.geocode({
    'location': latlng
  }, function (results, status) {
    if (status === 'OK') {
      if (results[0]) {
        // map.setZoom(11);
        var marker = new google.maps.Marker({
          position: latlng,
          map: map
        });
        markers.push(marker);
        infowindow.setContent(results[0].formatted_address);
        infowindow.open(map, marker);
        console.log(marker.position);
        document.getElementById("loc").value = results[0].formatted_address;
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

function clearMarker() {
  markers.forEach((e) => {
    e.setMap(null);
  });
  markers = [];
}