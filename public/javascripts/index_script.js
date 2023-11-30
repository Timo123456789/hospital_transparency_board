var map = L.map("map", {zoomControl: false}).setView([51.505, -0.09], 13);
map.panTo(new L.LatLng(51.9607, 7.6261));
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
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
var data = JSON.stringify()
var marker = L.marker([51.9607, 7.6261]).addTo(map);
var url = "http://localhost:3000/kh_verzeichnis";



// URL der Datei
var url = "http://localhost:3000/kh_verzeichnis";

// Datei lesen
fetch(url)
  .then(response => response.text())
  .then(data => {
    // Verarbeiten Sie die Daten hier
	console.log(data);
	console.log("______________________");
	data = JSON.parse(data);
	console.log(data);
	console.log("______________________");
	console.log(data.features[2]);

	// Angenommen, center ist der Mittelpunkt Ihres Radius
	var center = L.latLng(51.9607, 7.6261);

	// Angenommen, radius ist der Radius in Metern
	var radius = 10000; 

	for (let i = 0; i < data.features.length; i++) {
	var coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]];
	
	
	
	console.log(distance);
	if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined'){
		// Berechnen Sie die Entfernung zwischen dem Mittelpunkt und dem Marker
		var distance = center.distanceTo(coords);

		if (distance<=radius) {
			console.log(data.features[i].properties.name);
			text_json =  {"Name": data.features[i].properties.USER_Adresse_Name_Standort,
						"Strasse": data.features[i].properties.USER_Adresse_Strasse_Standort,
						"Postleitzahl": data.features[i].properties.USER_Adresse_Postleitzahl_Standort,
						"Ort": data.features[i].properties.USER_Adresse_Ort_Standort}
			console.log(text_json)
			var temp_marker = L.marker(coords).addTo(map).bindPopup(JSON.stringify(text_json));
		}


	}

	// for (let i = 0; i < data.features.length; i++) {
	// 	console.log(i);
	// 	coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]
	// 	console.log(coords);
	// 	if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined'){
	// 		console.log(data.features[i].properties.name);
	// 		text_json =  {"Name": data.features[i].properties.USER_Adresse_Name_Standort,
	// 					 "Strasse": data.features[i].properties.USER_Adresse_Strasse_Standort,
	// 					 "Postleitzahl": data.features[i].properties.USER_Adresse_Postleitzahl_Standort,
	// 					 "Ort": data.features[i].properties.USER_Adresse_Ort_Standort}
	// 		console.log(text_json)
	// 		L.marker(coords).addTo(map).bindPopup(JSON.stringify(text_json));
	// 	}
	 }


	
    
  })
  .catch(error => console.error('Fehler beim Lesen der Datei:', error));


 document.getElementById('button_PZC').addEventListener('click', function() {
    var inputValue = document.getElementById('input_PZC').value;
    // Hier können Sie Ihre Logik implementieren
	console.log(inputValue);

  });
