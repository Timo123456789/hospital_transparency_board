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

let markersHospital = []

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
function main () {
  setUserMarker([51.9607, 7.6261], icons)
  setHospitalMarker(10000, [51.9607, 7.6261], icons)
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
ratingSlider.addEventListener('input', function (e) {
  ratingInput.value = e.target.value
})

// Update the slider when the input field value changes
ratingInput.addEventListener('input', function (e) {
  ratingSlider.value = e.target.value
})

// functions ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function clearMarkers () {
  // lösche Krankenhausmarker im Umkreis
  for (let i = 0; i < markersHospital.length; i++) {
    markersHospital[i].remove()
  }

  // lösche User Position Marker
  userLocationMarker.remove()

  // leere das Array mit den Positionen
  markersHospital = []
}

function setUserMarker (coords, icons) {
  const greenIcon = icons[0]
  userLocationMarker = L.marker(coords, { icon: greenIcon })
  userLocationMarker.bindPopup('Your Position')
  map.addControl(userLocationMarker)
}

function setHospitalMarker (radius, center, icons) {
  const hospIcon = icons[1]
  const url = 'http://localhost:3000/kh_verzeichnis'
  // var markersHospital = new Array();
  center = L.latLng(center[0], center[1])

  // Datei lesen
  fetch(url)
    .then(response => response.text())
    .then(data => {
      // Verarbeiten Sie die Daten hier
      data = JSON.parse(data)
      // Angenommen, center ist der Mittelpunkt Ihres Radius

      for (let i = 0; i < data.features.length; i++) {
        const coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]

        if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
          // Berechnen Sie die Entfernung zwischen dem Mittelpunkt und dem Marker
          const distance = center.distanceTo(coords)
          // console.log(data.features[i]);
          if (distance <= radius) {
            const textJson = {
              Name: data.features[i].properties.Adresse_Name_Standort,
              Strasse: data.features[i].properties.Adresse_Strasse_Standort,
              HNR: data.features[i].properties['Adresse_Haus-Nr._Standort'],
              Postleitzahl: data.features[i].properties.Adresse_Postleitzahl_Standort,
              Ort: data.features[i].properties.Adresse_Ort_Standort,
              Telefon: data.features[i].properties['Telefonvorwahl/-nummer'],
              Website: data.features[i].properties['Internet-Adresse'],
              Email: data.features[i].properties['E-Mail Adresse'],
              Traeger: decodeTraeger(data.features[i].properties.Traeger),
              Typ: decodeType(data.features[i].properties.EinrichtungsTyp)
            }
            // Foramtierung der URL zur Webseite sodass nicht mehr auf Local Host verwiesen wird
            const websiteUrl = textJson.Website.startsWith('http') ? textJson.Website : 'http://' + textJson.Website
            const mailtoLink = textJson.Email ? `<a href="mailto:${textJson.Email}">${textJson.Email}</a>` : 'N/A'

            function decodeTraeger (value) {
              switch (value) {
                case 1:
                  return 'Öffentlich'
                case 2:
                  return 'Freigemeinnützig'
                case 3:
                  return 'Privat'
                default:
                  return 'Unbekannter Träger'
              }
            }

            function decodeType (value) {
              switch (value) {
                case 1:
                  return 'Hochschulklinik'
                case 2:
                  return 'Plankrankenhaus'
                case 3:
                  return 'Krankenhaus mit Versorgungsvertrag'
                case 4:
                  return 'Krankenhaus ohne Versorgungsvertrag'
                case 5:
                  return 'Bundeswehrkrankenhaus'
                default:
                  return 'Unbekannt'
              }
            }

            const tempMarker = L.marker(coords, { icon: hospIcon }).bindPopup(`
              <div style="font-size: 1.2em; font-weight: bold;">${textJson.Name}</div>
              <hr>
              <b>Address:</b> ${textJson.Strasse} ${textJson.HNR}, ${textJson.Postleitzahl} ${textJson.Ort}<br>
              <b>Phone Number:</b> ${textJson.Telefon}<br>
              <b>Website:</b> <a href="${websiteUrl}" target="_blank">${textJson.Website}</a><br>
              <b>E-mail:</b> ${mailtoLink}<br>
              <b>provider:</b> ${textJson.Traeger}<br>
              <b>Type:</b> ${textJson.Typ}<br>
              `
            )
            markersHospital.push(tempMarker)
          }
        }
      }

      for (let i = 0; i < markersHospital.length; i++) {
        map.addControl(markersHospital[i])
      }
    })
    .catch(error => console.error('Fehler beim Lesen der Datei:', error))
}

//  const geoCoder = NodeGeocoder(options);
//  document.getElementById('button_PZC').addEventListener('click', function () {
//  var inputValue = document.getElementById('input_PZC').value;
//  Hier können Sie Ihre Logik implementieren
//  var temp = geocoder.geocode(inputValue)
//  })
