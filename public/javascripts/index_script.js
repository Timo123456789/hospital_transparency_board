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
	console.log(data.features.length);


	for (let i = 0; i < data.features.length; i++) {
		console.log(i);
		coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]
		console.log(coords);
		if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined'){
			L.marker(coords).addTo(map);
		}
		

	}
    // for (var key in data) {
	// 	console.log(key);
	// 	var obj = data[key];
	// 	console.log(obj);
	// 	console.log(obj.features);
	// 	coords = [data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]]
	// 	console.log(coords);
	// 	var marker2 = L.marker(coords).addTo(map);
	// }
	
  })
  .catch(error => console.error('Fehler beim Lesen der Datei:', error));

function add_marker(data, L, map) {
	
	
}