function hoverEvent(x) {
  x.getElementsByTagName("img")[0].removeAttribute("hidden");
  var locationImgSrc = x.getElementsByTagName("img")[0].getAttribute("src");
  // var largeImage = document.getElementById("enlargedImage")
  // largeImage.removeAttribute("hidden");
  // largeImage.setAttribute("src", locationImgSrc);
}

var data = ["pictures/akerman.jpg", "pictures/coffman.jpg", "pictures/freetime.jpg", "pictures/hanson.jpg", "pictures/keller.jpg", "pictures/lab.jpg", "pictures/rec.jpg", "pictures/walter.jpg"];
var index = 0;

function nextPicture() {
  index = (index + 1) % data.length;
  document.getElementById("enlargedImage").src = data[index];
}


function startShow(x) {
  interval = setInterval(nextPicture, 2000);
}

function stopShow() {
  clearInterval(interval);
}

function mouseoutEvent(x) {
  x.getElementsByTagName("img")[0].setAttribute("hidden", true);
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en'
  }, 'google_translate_element');
}



function checkPassStrength(e) {
  e.preventDefault();
  let password = document.forms["passForm"]["password"].value;
  let strengthText = document.getElementById("strengthText");
  let strengthBar = document.getElementById("strengthBar");
  let strength = 0;

  if (password.length < 6) {
    strengthText.innerHTML = "Strength: Too short";
    strengthBar.style.width = "25%";
    strengthBar.style.backgroundColor = "red";
  } else {
    if (password.length > 7) strength += 1
    // If password contains both lower and uppercase characters, increase strength value.
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
    // If it has numbers and characters, increase strength value.
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
    // If it has one special character, increase strength value.
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
    // If it has two special characters, increase strength value.
    if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
    // Calculated strength value, we can return messages
    // If value is less than 2
    if (strength < 2) {
      strengthText.innerHTML = "Strength: Weak";
      strengthBar.style.width = "50%";
      strengthBar.style.backgroundColor = "orange";
    } else if (strength == 2) {
      strengthText.innerHTML = "Strength: Good";
      strengthBar.style.width = "75%";
      strengthBar.style.backgroundColor = "yellow";
    } else {
      strengthText.innerHTML = "Strength: Strong";
      strengthBar.style.width = "100%";
      strengthBar.style.backgroundColor = "green";
    }
  }
  return false;
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
  geocoder = new google.maps.Geocoder();
  service = new google.maps.places.PlacesService(map);
  infowindow = new google.maps.InfoWindow();
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  placeScheduleLocations();
}

function placeScheduleLocations() {
  const elements = Object.values(document.getElementsByClassName("scheduleItem"));
  const pairs = elements.reduce((acc, e) => {
    const eventNameElement = e.getElementsByClassName("eventName");
    const addressElement = e.getElementsByClassName("address");
    if (eventNameElement.length && addressElement.length) {
      return acc.concat([
        [eventNameElement[0].innerHTML, addressElement[0].innerHTML]
      ]);
    }
    return acc;
  }, []);

  const uniquePairs = [...new Set(pairs)];
  uniquePairs.forEach(([name, address]) => geocodeAddress(name, address));
}

function searchMap(e) {
  e.preventDefault();
  var searchType, keyword;
  const elem = document.getElementById("category");
  if (elem.options[elem.selectedIndex].value === "other") {
    searchType = undefined;
    keyword = document.getElementById("otherInput").value;
  } else {
    searchType = elem.options[elem.selectedIndex].value;
    keyword = undefined
  }
  const radius = document.getElementById("radius").value;
  mapQuery(radius, uOfM, searchType, keyword);
}

function mapQuery(radius, location, searchType, keyword) {
  var request = {
    fields: ['name', 'geometry'], // The things you want google to give back to you.
    radius: radius,
    location: location,
    type: searchType,
    keyword: keyword
  };

  service.nearbySearch(request, function (results, status, pagin) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearMarkers();
      for (var i = 0; i < results.length; i++) {
        markers.push(createMarker(results[i]));
      }
    }
  });
}

function clearMarkers() {
  markers.forEach((e) => {
    e.setMap(null);
  });
  markers = [];
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  marker.addListener('mouseover', function () {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });

  // assuming you also want to hide the infowindow when user mouses-out
  marker.addListener('mouseout', function () {
    infowindow.close();
  });
  return marker;
}


function geocodeAddress(name, address) {
  geocoder.geocode({
    'address': address
  }, function (results, status) {
    if (status === 'OK') {
      let marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        icon: {
          url: "pictures/dog.png",
          scaledSize: new google.maps.Size(30, 30)
        }
      });
      addInfoWindow(marker, name);
      markers.push(marker);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function addInfoWindow(marker, locationName) {
  let contentString = `
    <div>
      <h3 id="firstHeading" class="firstHeading">${locationName}</h1>
    </div>
  `;
  let infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  marker.addListener('click', function () {
    infowindow.open(map, marker);
  });
}

function categoryChangeHandler(e) {
  if (e.options[e.selectedIndex].value === "other") {
    document.getElementById("otherInput").removeAttribute("disabled");
  } else {
    let otherInput = document.getElementById("otherInput")
    otherInput.setAttribute("disabled", true);
  }
}

function getDirections(e) {
  e.preventDefault();
  document.getElementById("directionsBox").removeAttribute("hidden");
  const dest = document.getElementById("destination").value;
  const travelMethod = document.querySelector('input[name="transportationMethod"]:checked').value;
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      calcRoute(pos, dest, travelMethod);

    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function calcRoute(start, end, travelMethod) {
  var request = {
    origin: start,
    destination: end,
    travelMode: travelMethod
  };
  directionsService.route(request, function (result, status) {
    if (status == 'OK') {
      clearMarkers();
      directionsDisplay.setDirections(result);
    } else {}
  });
}