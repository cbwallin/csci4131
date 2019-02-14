function hoverEvent(x) {
  x.getElementsByTagName("img")[0].removeAttribute("hidden");
  var locationImgSrc = x.getElementsByTagName("img")[0].getAttribute("src");
  var largeImage = document.getElementById("enlargedImage")
  largeImage.removeAttribute("hidden");
  largeImage.setAttribute("src", locationImgSrc);
}

function mouseoutEvent(x) {
  x.getElementsByTagName("img")[0].setAttribute("hidden", true);
}

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

function initMap() {
  var uOfM = {
    lat: 44.9727,
    lng: -93.23540000000003
  };
  var map = new google.maps.Map(
    document.getElementById('map'), {
      zoom: 14,
      center: uOfM
    });
  var marker = new google.maps.Marker({
    position: uOfM,
    map: map
  });
}
