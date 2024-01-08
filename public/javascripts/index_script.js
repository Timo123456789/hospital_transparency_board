/* eslint-disable no-undef */
let userLocationMarker = null

const map = L.map('map', { zoomControl: false }).setView([51.505, -0.09], 13)
map.panTo(new L.LatLng(51.9607, 7.6261))
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  minZoom: 0,
  maxZoom: 20,

  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map)


// controls
L.control.zoom({
  position: 'bottomright'

}).addTo(map)
L.control.scale({
  metric: true,
  position: 'bottomright'
}).addTo(map)


let markers_hospital = []

/**
*@desc declaration of Green Marker for Leafleat Map
*@Source  https://github.com/pointhi/leaflet-color-markers/tree/master/img
*/

const greenIcon = new L.Icon({

  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]

})

const hospIcon = new L.Icon({

  iconUrl: 'https://icons.veryicon.com/png/o/healthcate-medical/medical-icon-library/hospital-9.png',

  iconSize: [25, 25],
  iconAnchor: [6, 20],
  popupAnchor: [5, -10],
  shadowSize: [41, 41]

})
const icons = [greenIcon, hospIcon]

main()
function main() {
  set_user_marker([51.9607, 7.6261], icons)
  set_hospital_marker(10000, [51.9607, 7.6261], icons)
}

// event listener ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Event Listener für den Button
document.getElementById('button_getUserLoc').addEventListener('click', function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      clearMarkers()

      // setze User Position Marker
      const coords = [lat, lng]
      setUserMarker(coords, icons)

      // set hospitals markers
      const radius = document.getElementById('radiusInput').value

      setHospitalMarker(radius, coords, icons)

      // Zoom to user location
      // var markerBounds = L.latLngBounds(coords);
      map.flyTo(coords, 13)
    }, function (error) {
      console.error('Fehler beim Abrufen der Position:', error)
    })
  } else {
    console.log('Geolocation wird von Ihrem Browser nicht unterstützt')
  }
})

// Event Listener for radius slider
const radiusSlider = document.getElementById('radiusSlider')
const radiusInput = document.getElementById('radiusInput')

// Update the input field when the slider value changes
radiusSlider.addEventListener('input', function (e) {
  radiusInput.value = e.target.value
})

// Update the slider when the input field value changes
radiusInput.addEventListener('input', function (e) {
  radiusSlider.value = e.target.value
})

// Event Listener for rating slider
const ratingSlider = document.getElementById('ratingSlider')
const ratingInput = document.getElementById('ratingInput')

// Update the input field when the slider value changes
// ratingSlider.addEventListener('input', function (e) {
//   ratingInput.value = e.target.value
// })

// Update the slider when the input field value changes
// ratingInput.addEventListener('input', function (e) {
//   ratingSlider.value = e.target.value
// })

// functions ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function clearMarkers() {
  // lösche Krankenhausmarker im Umkreis
  for (let i = 0; i < markersHospital.length; i++) {
    markersHospital[i].remove()
  }

  // lösche User Position Marker
  userLocationMarker.remove()
}



document.getElementById('button_getUserLoc').addEventListener('click', async function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      clear_markers()

      //setze User Position Marker
      coords = [lat, lng]
      set_user_marker(coords, icons)

      //set hospitals markers
      var radius = document.getElementById('radiusInput').value;
      var data = await getData()
      console.log(data);
      var test = filter_radius(radius, coords, data)
      console.log(test);
      set_hospital_marker(radius, coords, icons)

      //Zoom to user location
      //var markerBounds = L.latLngBounds(coords);
      map.flyTo(coords, 13);

    }, function (error) {
      console.error('Fehler beim Abrufen der Position:', error);
    });
  } else {
    console.log('Geolocation wird von Ihrem Browser nicht unterstützt');
  }
});





document.getElementById('button_setMarker').addEventListener('click', function () {
  clear_markers()
  map.once('click', function (e) {
    //var marker = L.marker(e.latlng).addTo(map);
    console.log(e.latlng);
    coords = [e.latlng.lat, e.latlng.lng]
    console.log(coords);
    set_user_marker(coords, icons)
    set_hospital_marker(10000, coords, icons)
  });

});


//Funktion muss Async sein, da sonst die Daten nicht rechtzeitig geladen werden (s. Z. 109, Col 68 )
// Await muss in Zeile 131 eingesetzt werden damit auf die Rückgabe vom Server gewartet wird (sonst ist die Variable leer/undefined)
document.getElementById('button_submit').addEventListener('click', async function () {
  clear_markers()
  var array_prov = check_provider();
  //var temp = document.getElementById('button_providerType');	
  //clear_markers()
  console.log(array_prov);
  //console.log(getData());
  var data = await getData()
  console.log("_____________");
  console.log(data);
  console.log("_______________");
  var filtered_markers = filterProvider(data, array_prov);
  console.log(filtered_markers);
  set_filtered_kh_marker(filtered_markers)
  markers_hospital = filtered_markers;
  console.log(filtered_markers);
  filtered_markers = [];
  console.log(filtered_markers);
});


//functions ---------------------------------------------------------------------------------------------------------------
function filter_radius(radius, center, data) {
  var filtered_data = [];
  center = L.latLng(center[0], center[1]);
  for (let i = 0; i < data.features.length; i++) {
    var coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]];
    if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
      // Berechnen Sie die Entfernung zwischen dem Mittelpunkt und dem Marker
      console.log(coords);
      console.log(center);
      var distance = center.distanceTo(coords);
      //console.log(data.features[i]);
      if (distance <= radius) {

        var temp = create_marker(data.features[i], coords, hospIcon)
        filtered_data.push(temp)
      }
    }
  }
  return filtered_data;
}

function set_filtered_kh_marker(markers_hospital) {
  console.log("_____________test_____________");
  console.log(markers_hospital);
  for (let i = 0; i < markers_hospital.length; i++) {
    map.addControl(markers_hospital[i])
  }
}

function check_provider() {
  let checkboxes = document.querySelectorAll('.btn-check');
  var array_prov = [];
  // Iterieren Sie durch die Checkboxen
  for (let i = 0; i < checkboxes.length; i++) {
    // Überprüfen Sie, ob die Checkbox ausgewählt ist
    if (checkboxes[i].checked) {
      var temp = {
        checkbox: i,
        value: checkboxes[i].value
      }
      array_prov.push(temp)
      // Die Checkbox ist ausgewählt, tun Sie etwas
      console.log('Checkbox ' + (i + 1) + ' ist ausgewählt.');
    }
  }
  console.log("array_prov: " + array_prov);
  return array_prov;
}

function filterProvider(data, array_prov) {
  var markers_hospital = new Array();
  console.log("filterProvider - data: " + data);
  for (let i = 0; i < data.features.length; i++) {
    var coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]];

    if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
      for (let j = 0; j < array_prov.length; j++) {
        //console.log(data.features[i].properties.Traeger);
        //console.log(array_prov[j].value);
        if (data.features[i].properties.Traeger == array_prov[j].value) {
          var temp = create_marker(data.features[i], coords, hospIcon)
          markers_hospital.push(temp)
        }
      }
    }
  }
  return markers_hospital;
}



//Funktion muss insgesamt Async sein, da sonst die Daten nicht rechtzeitig geladen werden; wird mit try catch Anweisung ausgeführt (er probiert mit nem response Befehl (Z.173), der den Fetch Teil ansteuert, die Daten zu laden, wenn das nicht klappt, wird der Fehler (Z.178) ausgegeben). Zeile 174 ist nur für die Verarbeitung der Daten zuständig, die in Zeile 173 geladen werden. (Dieser Satz wurde von Copilot vorgeschlagen, so richtig verstehe ich Zeile 173-174 nicht)
async function getData() {
  var url = "http://localhost:3000/kh_verzeichnis";
  try {
    // Datei lesen
    const response = await fetch(url);
    const data = await response.text();
    // Verarbeiten Sie die Daten hier
    return JSON.parse(data);
  } catch (error) {
    console.error('Fehler beim Lesen der Datei:', error);
  }
}

function clear_markers() {
  console.log("clear");
  //lösche Krankenhausmarker im Umkreis
  for (let i = 0; i < markers_hospital.length; i++) {
    markers_hospital[i].remove()
  }

  //lösche User Position Marker
  user_loc_marker.remove()

  //leere das Array mit den Positionen
  markers_hospital = new Array();
}

function set_user_marker(coords, icons) {
  var greenIcon = icons[0]
  user_loc_marker = L.marker(coords, { icon: greenIcon })
  user_loc_marker.bindPopup("Your Position");
  map.addControl(user_loc_marker)
}

function set_hospital_marker(radius, center, icons) {
  var hospIcon = icons[1]
  var url = "http://localhost:3000/kh_verzeichnis";
  //var markers_hospital = new Array();
  center = L.latLng(center[0], center[1]);

  var radius = document.getElementById('radiusInput').value;


  // Datei lesen
  fetch(url)
    .then(response => response.text())
    .then(data => {
      // Verarbeiten Sie die Daten hier

      data = JSON.parse(data);
      // Angenommen, center ist der Mittelpunkt Ihres Radius		

      for (let i = 0; i < data.features.length; i++) {
        var coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]];

        if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
          // Berechnen Sie die Entfernung zwischen dem Mittelpunkt und dem Marker
          var distance = center.distanceTo(coords);
          //console.log(data.features[i]);
          if (distance <= radius) {

            var temp = create_marker(data.features[i], coords, hospIcon)
            markers_hospital.push(temp)

          }
        }
      }

      for (let i = 0; i < markers_hospital.length; i++) {
        map.addControl(markers_hospital[i])
      }
    })
    .catch(error => console.error('Fehler beim Lesen der Datei:', error));
}

//Es muss abgefragt werden ob das entsprechende Property Argument vorhanden ist ( != null) sonst wirft er beim Erstellen Fehler, Lösungvorschlag s. Z. 285
function create_marker(data, coords, hospIcon) {
  //console.log(data);
  //console.log(data.Feature);
  //console.log(data.properties);
  text_json = {
    "Name": data.properties.Adresse_Name_Standort,
    "Strasse": data.properties.Adresse_Strasse_Standort,
    "HNR": data.properties["Adresse_Haus-Nr._Standort"],
    "Postleitzahl": data.properties.Adresse_Postleitzahl_Standort,
    "Ort": data.properties.Adresse_Ort_Standort,
    "Telefon": data.properties["Telefonvorwahl/-nummer"],
    "Website": data.properties["Internet-Adresse"],
    "Email": data.properties["E-Mail Adresse"],
    "Traeger": decodeTraeger(data.properties.Traeger),
    "Typ": decodeType(data.properties.EinrichtungsTyp)
  }

  //Foramtierung der URL zur Webseite sodass nicht mehr auf Local Host verwiesen wird
  if (text_json.Website != null) {
    var websiteUrl = text_json.Website.startsWith("http") ? text_json.Website : "http://" + text_json.Website;
  } else {
    websiteUrl = "N/A"
  }


  var mailtoLink = text_json.Email ? `<a href="mailto:${text_json.Email}">${text_json.Email}</a>` : 'N/A';



  temp_marker = L.marker(coords, { icon: hospIcon }).bindPopup(`
		<div style="font-size: 1.2em; font-weight: bold;">${text_json.Name}</div>
		<hr>
		<b>Address:</b> ${text_json.Strasse} ${text_json.HNR}, ${text_json.Postleitzahl} ${text_json.Ort}<br>
		<b>Phone Number:</b> ${text_json.Telefon}<br>
		<b>Website:</b> <a href="${websiteUrl}" target="_blank">${text_json.Website}</a><br>
		<b>E-mail:</b> ${mailtoLink}<br>
		<b>provider:</b> ${text_json.Traeger}<br>
		<b>Type:</b> ${text_json.Typ}<br>
		`);
  return temp_marker;
}

function decodeTraeger(value) {
  switch (value) {
    case 1:
      return "Öffentlich";
    case 2:
      return "Freigemeinnützig";
    case 3:
      return "Privat";
    default:
      return "Unbekannter Träger";
  }
}

function decodeType(value) {
  switch (value) {
    case 1:
      return "Hochschulklinik";
    case 2:
      return "Plankrankenhaus";
    case 3:
      return "Krankenhaus mit Versorgungsvertrag";
    case 4:
      return "Krankenhaus ohne Versorgungsvertrag";
    case 5:
      return "Bundeswehrkrankenhaus";
    default:
      return "Unbekannt";
  }
}




