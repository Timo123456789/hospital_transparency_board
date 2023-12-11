

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

var markers_kh_pos = new Array();

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
icons = [greenIcon, hospIcon]


main();
function main() {


	
	set_user_marker([51.9607, 7.6261], icons)
	set_kh_marker(10000, [51.9607, 7.6261], icons)


}






document.getElementById('button_getUserLoc').addEventListener('click', function () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			clear_markers()

			//setze User Position Marker
			coords = [lat, lng]
			set_user_marker(coords, icons)

			//set hospitals markers
			var radius = document.getElementById('input_radius').value;
			
			set_kh_marker(radius, coords, icons)

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
	map.once('click', function(e) {
        //var marker = L.marker(e.latlng).addTo(map);
		console.log(e.latlng);
		coords = [e.latlng.lat, e.latlng.lng]
		console.log(coords);
		set_user_marker(coords, icons)
		set_kh_marker(10000, coords, icons)
    });

});


function clear_markers() {
	
	//lösche Krankenhausmarker im Umkreis
	for (let i = 0; i < markers_kh_pos.length; i++) {
		markers_kh_pos[i].remove()
	}

	//lösche User Position Marker
	user_loc_marker.remove()

	//leere das Array mit den Positionen
	markers_kh_pos = new Array();
}

function set_user_marker(coords, icons) {
	var greenIcon = icons[0]
	user_loc_marker = L.marker(coords, { icon: greenIcon })
	user_loc_marker.bindPopup("Your Position");
	map.addControl(user_loc_marker)
}

function set_kh_marker(radius, center, icons) {
	var hospIcon = icons[1]
	var url = "http://localhost:3000/kh_verzeichnis";
	//var markers_kh_pos = new Array();
	center = L.latLng(center[0], center[1]);

	var markers
	var radius = document.getElementById('input_radius').value;

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
						text_json = {
							"Name": data.features[i].properties.Adresse_Name_Standort,
							"Strasse": data.features[i].properties.Adresse_Strasse_Standort,
							"HNR": data.features[i].properties["Adresse_Haus-Nr._Standort"],
							"Postleitzahl": data.features[i].properties.Adresse_Postleitzahl_Standort,
							"Ort": data.features[i].properties.Adresse_Ort_Standort,
							"Telefon": data.features[i].properties["Telefonvorwahl/-nummer"],
							"Website": data.features[i].properties["Internet-Adresse"],
							"Email": data.features[i].properties["E-Mail Adresse"],
							"Traeger": decodeTraeger(data.features[i].properties.Traeger),
							"Typ": decodeType(data.features[i].properties.EinrichtungsTyp)
						}
						//Foramtierung der URL zur Webseite sodass nicht mehr auf Local Host verwiesen wird
						var websiteUrl = text_json.Website.startsWith("http") ? text_json.Website : "http://" + text_json.Website;
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



