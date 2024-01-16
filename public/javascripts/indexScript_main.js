/* eslint-disable no-undef */
let userLocationMarker = null
let markersHospital = []
let filtered_khs = []
const allKhsAutocompleteArr = new Array();
const allKhsDict = new Object();

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
      clearMarker()

      // setze User Position Marker
      const coords = [lat, lng]
      setUserMarker(coords, icons)

      // set hospitals markers
      const radius = document.getElementById('radiusInput').value
      setHospitalMarker(radius, coords, icons)

      // Zoom to user location
      map.flyTo(coords, 13)
    }, function (error) {
      console.error('Fehler beim Abrufen der Position:', error)
    })
  } else {
    console.log('Geolocation wird von Ihrem Browser nicht unterstützt')
  }
})

// functions ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
document.getElementById('button_getUserLoc').addEventListener('click', async function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async function (position) {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      clearMarker()

      // setze User Position Marker
      coords = [lat, lng]
      setUserMarker(coords, icons)

      // set hospitals markers
      const radius = document.getElementById('radiusInput').value
      const data = await getData()
      console.log(data)
      const test = filterRadius(radius, coords, data)
      console.log(test)
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

document.getElementById('button_setMarker').addEventListener('click', async function () {
  clearMarker()
  data = await getData()
  map.once('click', function (e) {
    // var marker = L.marker(e.latlng).addTo(map);
    console.log(e.latlng)
    coords = [e.latlng.lat, e.latlng.lng]
    console.log(coords)
    const arrayCheckboxes = checkCheckboxes()
    setUserMarker(coords, icons)

    if (arrayCheckboxes != null) {
      let radius_filtered_data = filterRadius(coords, data)
      let filteredMarkers = filterData(radius_filtered_data, arrayCheckboxes)
      setFilteredHospitalMarker(filteredMarkers)
      markersHospital = filteredMarkers
      filteredMarkers = []
      setHospitalMarker(10000, coords, icons)
    }


  })
})

// Funktion muss Async sein, da sonst die Daten nicht rechtzeitig geladen werden (s. Z. 109, Col 68 )
// Await muss in Zeile 131 eingesetzt werden damit auf die Rückgabe vom Server gewartet wird (sonst ist die Variable leer/undefined)
document.getElementById('button_submit').addEventListener('click', async function () {
  clearMarker()
  data = await getData()
  if (userLocationMarker != null) {
    coords = userLocationMarker.getLatLng()
    coords = [coords.lat, coords.lng]
    setUserMarker(coords, icons)
  }
  const arrayCheckboxes = checkCheckboxes()
  filtered_khs = filterRadius(coords, data)
  // var temp = document.getElementById('button_providerType');
  // clearMarker()
  // console.log(getData());
  //const data = await getData()

  let filteredMarkers = filterData(filtered_khs, arrayCheckboxes)
  setFilteredHospitalMarker(filteredMarkers)
  markersHospital = filteredMarkers
  filteredMarkers = []
})

// functions ---------------------------------------------------------------------------------------------------------------
function filterRadius(center, data) {
  const filteredData = []
  radius = (document.getElementById('radiusSlider').value) * 1000


  center = L.latLng(center[0], center[1])
  for (let i = 0; i < data.features.length; i++) {
    const coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]
    if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
      const distance = center.distanceTo(coords)
      if (distance <= radius) {
        filteredData.push(data.features[i])
      }
    }
  }

  FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredData
  }
  return FeatureCollection

}



function setFilteredHospitalMarker(markersHospital) {
  for (let i = 0; i < markersHospital.length; i++) {
    map.addControl(markersHospital[i])
  }
}

function checkCheckboxes() {
  const arrayProv = []
  const checkboxes = document.querySelectorAll('.checkbox-group:checked')
  console.log(checkboxes);
  if (checkboxes.length == 0) {
    return null
  }
  else {
    const selectedValues = Array.from(checkboxes).map(cb => cb.id)
    temp = 0
    temp2 = 0
    for (let i = 0; i < selectedValues.length; i++) {
      temp = selectedValues[i]
      temp2 = {
        checkbox: i,
        value: temp
      }
      arrayProv.push(temp2)
    }
    return arrayProv
  }



}

function filterData(data, arrayCheckboxes) {
  const markersHospital = []
  //console.log('filterProvider - data: ' + data)
  //console.log(arrayCheckboxes)
  for (let i = 0; i < data.features.length; i++) {
    const coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]

    if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
      if (filterOneKh(data.features[i], arrayCheckboxes) === true) {
        console.log('true')
        const temp = createMarker(data.features[i], coords, hospIcon)
        //console.log(temp)
        markersHospital.push(temp)
      } else {
        console.log('false')
      }

    }
  }

  return markersHospital
}



function filterOneKh(data, arrayCheckboxes) {
  let match = []
  let sel_typ = []
  let sel_traeger = []

  for (let j = 0; j < arrayCheckboxes.length; j++) {
    if (arrayCheckboxes[j].value.includes('typ')) {
      sel_typ.push(parseInt(arrayCheckboxes[j].value.match(/\d+/g)[0]))
    }
    if (arrayCheckboxes[j].value.includes('traeger')) {
      sel_traeger.push(parseInt(arrayCheckboxes[j].value.match(/\d+/g)[0]))
    }
  }

  for (let j = 0; j < sel_typ.length; j++) {
    for (let i = 0; i < sel_traeger.length; i++) {
      if (data.properties.EinrichtungsTyp == sel_typ[j] && data.properties.Traeger == sel_traeger[i]) {
        match.push(true)
      }
      else {
        match.push(false)
      }

    }
  }

  for (let m = 0; m < match.length; m++) {
    if (match[m] == true) {
      return true
    }
  }
  return false
}


// Funktion muss insgesamt Async sein, da sonst die Daten nicht rechtzeitig geladen werden; wird mit try catch Anweisung ausgeführt (er probiert mit nem response Befehl (Z.173), der den Fetch Teil ansteuert, die Daten zu laden, wenn das nicht klappt, wird der Fehler (Z.178) ausgegeben). Zeile 174 ist nur für die Verarbeitung der Daten zuständig, die in Zeile 173 geladen werden. (Dieser Satz wurde von Copilot vorgeschlagen, so richtig verstehe ich Zeile 173-174 nicht)
async function getData() {
  const url = 'http://localhost:3000/kh_verzeichnis'
  try {
    // Datei lesen
    const response = await fetch(url)
    const data = await response.text()
    // Verarbeiten Sie die Daten hier
    return JSON.parse(data)
  } catch (error) {
    console.error('Fehler beim Lesen der Datei:', error)
  }
}

function clearMarker() {
  // lösche User Position Marker
  userLocationMarker.remove()

  // lösche Hospital Marker
  markersHospital.forEach(hospitalMarker => {
    hospitalMarker.remove()
  })
  markersHospital = []
}

function setUserMarker(coords, icons) {
  const greenIcon = icons[0]
  userLocationMarker = L.marker(coords, { icon: greenIcon })
  userLocationMarker.bindPopup('Your Position')
  map.addControl(userLocationMarker)
}

function setHospitalMarker(radius, center, icons) {
  const hospIcon = icons[1]
  const url = 'http://localhost:3000/kh_verzeichnis'
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
            const temp = createMarker(data.features[i], coords, hospIcon)
            markersHospital.push(temp)
          }
        }
      }

      for (let i = 0; i < markersHospital.length; i++) {
        map.addControl(markersHospital[i])
      }
    })
    .catch(error => console.error('Fehler beim Lesen der Datei:', error))
}

// Es muss abgefragt werden ob das entsprechende Property Argument vorhanden ist ( != null) sonst wirft er beim Erstellen Fehler, Lösungvorschlag s. Z. 285
function createMarker(data, coords, hospIcon) {
  textJson = {
    Name: data.properties.Adresse_Name_Standort,
    Strasse: data.properties.Adresse_Strasse_Standort,
    HNR: data.properties['Adresse_Haus-Nr._Standort'],
    Postleitzahl: data.properties.Adresse_Postleitzahl_Standort,
    Ort: data.properties.Adresse_Ort_Standort,
    Telefon: data.properties['Telefonvorwahl/-nummer'],
    Website: data.properties['Internet-Adresse'],
    Email: data.properties['E-Mail Adresse'],
    Traeger: decodeTraeger(data.properties.Traeger),
    Typ: decodeType(data.properties.EinrichtungsTyp)
  }

  // Formatierung der URL zur Webseite sodass nicht mehr auf Local Host verwiesen wird
  let websiteUrl = 'N/A' // Default-Wert, wenn die Website null ist
  if (textJson.Website) {
    websiteUrl = textJson.Website.startsWith('http') ? textJson.Website : 'http://' + textJson.Website
  }

  const mailtoLink = textJson.Email ? `<a href="mailto:${textJson.Email}">${textJson.Email}</a>` : 'N/A'

  tempMarker = L.marker(coords, { icon: hospIcon }).bindPopup(`
      <div style="font-size: 1.2em; font-weight: bold;">${textJson.Name}</div>
      <hr>
      <b>Address:</b> ${textJson.Strasse} ${textJson.HNR}, ${textJson.Postleitzahl} ${textJson.Ort}<br>
      <b>Phone Number:</b> ${textJson.Telefon}<br>
      <b>Website:</b> <a href="${websiteUrl}" target="_blank">${textJson.Website}</a><br>
      <b>E-mail:</b> ${mailtoLink}<br>
      <b>provider:</b> ${textJson.Traeger}<br>
      <b>Type:</b> ${textJson.Typ}<br>
      `)
  return tempMarker
}

function decodeTraeger(value) {
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

function decodeType(value) {
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

/**
 * @description creates a dictionary with all the KHS
 */
async function createDataDict() {
  const data = await getData()
  data.features.forEach(khs => {
    allKhsDict[khs.properties.Adresse_Name_Standort] = khs
  })
}

/**
 * @description handles the event, when the user selects a KHS from the search bar
 * @param {string} selectKhs - the name of the selected KHS
 */
function KhsSearchHandler(selectKhs) {
  const coords = [allKhsDict[selectKhs].geometry.coordinates[1], allKhsDict[selectKhs].geometry.coordinates[0]]
  map.setView(coords, 13)
  clearMarker()
  setUserMarker(coords, icons)
  setHospitalMarker(10000, coords, icons)
}

/**
 * @description creates a list of all hospitals for the autocomplete function
 */
async function createAutocomplete() {
  // eventuell kann noch der Ort als sucherweiterung hinzugefügt werden
  const datalist = document.getElementById('allKHS');
  const data = await getData()
  data.features.forEach(khs => {
    allKhsAutocompleteArr.push(khs.properties.Adresse_Name_Standort);
  })

  allKhsAutocompleteArr.forEach(khs => {
    var option = document.createElement('option');
    option.value = khs;
    datalist.appendChild(option);
  })
}

createDataDict()
createAutocomplete()