var map = L.map("map", { zoomControl: false }).setView([51.505, -0.09], 13);
map.panTo(new L.LatLng(51.9607, 7.6261));
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}).addTo(map);

// controls
L.control.zoom({
	position: 'bottomright'
}).addTo(map);
L.control.scale({
	metric: true,
	position: 'bottomright'
}).addTo(map);


//test

/**
*@desc declaration of Green Marker for Leafleat Map
*@Source  https://github.com/pointhi/leaflet-color-markers/tree/master/img
*/
var greenIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var hospIcon = new L.Icon({
	iconUrl: 'https://icons.veryicon.com/png/o/healthcate-medical/medical-icon-library/hospital-9.png',
	
	iconSize: [25, 25],
	iconAnchor: [6, 20],
	popupAnchor: [5, -10],
	shadowSize: [41, 41]
});



var data = JSON.stringify()
var user_loc_marker = L.marker([51.9607, 7.6261], { icon: greenIcon })
user_loc_marker.bindPopup("Your Position");
map.addControl(user_loc_marker)




// URL der Datei
var url = "http://localhost:3000/kh_verzeichnis";
var markers_kh_pos = new Array();

// Datei lesen
fetch(url)
	.then(response => response.text())
	.then(data => {
		// Verarbeiten Sie die Daten hier
		data = JSON.parse(data);

		// Angenommen, center ist der Mittelpunkt Ihres Radius
		var center = L.latLng(51.9607, 7.6261);

		// Angenommen, radius ist der Radius in Metern
		var radius = 10000;

		for (let i = 0; i < data.features.length; i++) {
			var coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]];

			if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
				// Berechnen Sie die Entfernung zwischen dem Mittelpunkt und dem Marker
				var distance = center.distanceTo(coords);

				if (distance <= radius) {
					text_json = {
						"Name": data.features[i].properties.USER_Adresse_Name_Standort,
						"Strasse": data.features[i].properties.USER_Adresse_Strasse_Standort,
						"HNR": data.features[i].properties.USER_Adresse_Haus_Nr__Standort,
						"Postleitzahl": data.features[i].properties.USER_Adresse_Postleitzahl_Standort,
						"Ort": data.features[i].properties.USER_Adresse_Ort_Standort
					}
					temp_marker = L.marker(coords, { icon: hospIcon }).bindPopup("Name: " + text_json.Name + "<br>" + "Adress: " + text_json.Strasse + " " + text_json.HNR + ", " + text_json.Postleitzahl + " " + text_json.Ort)
					markers_kh_pos.push(temp_marker)


					//markers_kh_pos = L.marker(coords).bindPopup("Name: " + text_json.Name + "<br>" + "Adress: " + text_json.Strasse +" " + text_json.HNR + ", " + text_json.Postleitzahl + " " + text_json.Ort).addTo(map);

					// marker_group_kh_locs = L.featureGroup().addTo(map);
					// L.marker(coords).addTo(marker_group_kh_locs).bindPopup("Name: " + text_json.Name + "<br>" + "Adress: " + text_json.Strasse +" " + text_json.HNR + ", " + text_json.Postleitzahl + " " + text_json.Ort);
				}
			}
		}
		for (let i = 0; i < markers_kh_pos.length; i++) {
			map.addControl(markers_kh_pos[i])
		}
	})
	.catch(error => console.error('Fehler beim Lesen der Datei:', error));




document.getElementById('button_getUserLoc').addEventListener('click', function () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			clear_markers()

			//setze User Position Marker
			coords = [lat, lng]
			set_user_marker(coords)

			//set hospitals markers
			set_kh_marker(10000, coords)

			//Zoom to user location
			//var markerBounds = L.latLngBounds(coords);
			map.flyto(coords, 15);

		}, function (error) {
			console.error('Fehler beim Abrufen der Position:', error);
		});
	} else {
		console.log('Geolocation wird von Ihrem Browser nicht unterstützt');
	}


});




function clear_markers() {
	//lösche Krankenhausmarker im Umkreis
	for (let i = 0; i < markers_kh_pos.length; i++) {
		markers_kh_pos[i].remove()
	}

	//lösche User Position Marker
	user_loc_marker.remove()
}

function set_user_marker(coords) {
	user_loc_marker = L.marker(coords, { icon: greenIcon })
	user_loc_marker.bindPopup("Your Position");
	map.addControl(user_loc_marker)
}

function set_kh_marker(radius, center) {
	var url = "http://localhost:3000/kh_verzeichnis";
	var markers_kh_pos = new Array();
	center = L.latLng(center[0], center[1]);

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

					if (distance <= radius) {
						text_json = {
							"Name": data.features[i].properties.USER_Adresse_Name_Standort,
							"Strasse": data.features[i].properties.USER_Adresse_Strasse_Standort,
							"HNR": data.features[i].properties.USER_Adresse_Haus_Nr__Standort,
							"Postleitzahl": data.features[i].properties.USER_Adresse_Postleitzahl_Standort,
							"Ort": data.features[i].properties.USER_Adresse_Ort_Standort
						}
						temp_marker = L.marker(coords).bindPopup("Name: " + text_json.Name + "<br>" + "Adress: " + text_json.Strasse + " " + text_json.HNR + ", " + text_json.Postleitzahl + " " + text_json.Ort)
						markers_kh_pos.push(temp_marker)

					}
				}
			}

			for (let i = 0; i < markers_kh_pos.length; i++) {
				map.addControl(markers_kh_pos[i])
			}
		})
		.catch(error => console.error('Fehler beim Lesen der Datei:', error));
}


const geoCoder = NodeGeocoder(options);
document.getElementById('button_PZC').addEventListener('click', function () {
	var inputValue = document.getElementById('input_PZC').value;
	// Hier können Sie Ihre Logik implementieren
	var temp = geocoder.geocode(inputValue)
	})
		


// document.getElementById('button_PZC').addEventListener('click', function () {
// 	console.log("button_PZC clicked");
// 	var inputValue = document.getElementById('input_PZC').value;
// 	console.log(inputValue);
// 	// Hier können Sie Ihre Logik implementieren
// 	var temp = geocoder.geocode(inputValue)
		
// 			console.log(inputValue);
// 			console.log(res[0].latitude, res[0].longitude);


// });
	