/* eslint-disable no-undef */
let khsWithSpez
let khsWithSpezFiltered
let userLocationMarker = null
let markersHospital = []
let filteredKhs = []
let filteredHospSpez = []
let routingButtonClicked = false
const allKhsAutocompleteArr = []
const allKhsDict = {}
const nvObj = {
  1: {
    Name: 'Allgemeine_Notfallversorgung',
    Value: [1, 2, 3]
  },
  2: {
    Name: 'Spezielle_Notfallversorgung_schwerverletzte',
    Value: [2]
  },
  3: {
    Name: 'Spezielle_Notfallversorgung_kinder',
    Value: [2]
  },
  4: {
    Name: 'Spezielle_Notfallversorgung_schlaganfall',
    Value: [2]
  },
  5: {
    Name: 'Spezielle_Notfallversorgung_Herz',
    Value: [2]
  }
}
let map = null
let routingControl = null
const loader = document.getElementById('loader')
const mapContainer = document.getElementById('map')

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

window.onload = function () {
  map = L.map('map', { zoomControl: false }).setView([51.505, -0.09], 13)
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

  routingControl = L.Routing.control({
    waypoints: [],
    createMarker: function (i, wp, nWps) {
      // Don't create a marker for the destination
      if (i === nWps - 1) {
        return null
      } else {
        // Create a marker for the start point
        return L.marker(wp.latLng)
      }
    }
  }).addTo(map)
  routingControl.hide()

  main()
  function main () {
    setUserMarker([51.9607, 7.6261])
    setHospitalMarker(10000, [51.9607, 7.6261])
  }

  // event listener ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // Event Listener für den Button
  document.getElementById('button_getUserLoc').addEventListener('click', async function () {
    loader.classList.remove('visually-hidden')
    mapContainer.style.opacity = '0.5'
    endHeatmap()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async function (position) {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        clearMarker()
        data = await getData()
        dataSpez = await getDataSpez()

        // setze User Position Marker
        coords = [lat, lng]
        // safe user location in hidden field for notfall search
        document.getElementById('userLocationField').value = '{"lat":' + coords[0] + ', "lon":' + coords[1] + '}'
        setUserMarker(coords)
        arrayCheckboxes = checkCheckboxes()
        if (arrayCheckboxes != null) {
          const radiusFilteredData = filterRadius(coords, data, dataSpez)
          let filteredMarkers = filterData(radiusFilteredData, arrayCheckboxes)
          setFilteredHospitalMarker(filteredMarkers)
          markersHospital = filteredMarkers
          filteredMarkers = []
        }

        // Zoom to user location
        // var markerBounds = L.latLngBounds(coords);
        map.flyTo(coords, 13)
        loader.classList.add('visually-hidden')
        mapContainer.style.opacity = '1'
      }, function (error) {
        console.error('Fehler beim Abrufen der Position:', error)
      })
    } else {
      console.log('Geolocation wird von Ihrem Browser nicht unterstützt')
    }
  })

  document.getElementById('button_setMarker').addEventListener('click', async function () {
    endHeatmap()
    clearMarker()
    data = await getData()
    dataSpez = await getDataSpez()
    map.once('click', function (e) {
      // var marker = L.marker(e.latlng).addTo(map);
      coords = [e.latlng.lat, e.latlng.lng]
      // safe user location in hidden field for notfall search
      document.getElementById('userLocationField').value = '{"lat":' + coords[0] + ', "lon":' + coords[1] + '}'
      const arrayCheckboxes = checkCheckboxes()
      setUserMarker(coords)

      if (arrayCheckboxes != null) {
        const radiusFilteredData = filterRadius(coords, data, dataSpez)
        let filteredMarkers = filterData(radiusFilteredData, arrayCheckboxes)
        setFilteredHospitalMarker(filteredMarkers)
        markersHospital = filteredMarkers
        filteredMarkers = []
      }
    })
  })

  // Funktion muss Async sein, da sonst die Daten nicht rechtzeitig geladen werden (s. Z. 109, Col 68 )
  // Await muss in Zeile 131 eingesetzt werden damit auf die Rückgabe vom Server gewartet wird (sonst ist die Variable leer/undefined)
  document.getElementById('button_submit').addEventListener('click', async function () {
    endHeatmap()
    clearMarker()
    data = await getData()
    dataSpez = await getDataSpez()
    if (userLocationMarker != null) {
      coords = userLocationMarker.getLatLng()
      coords = [coords.lat, coords.lng]
      setUserMarker(coords)
    }
    const arrayCheckboxes = checkCheckboxes()
    filteredKhs = filterRadius(coords, data, dataSpez)

    let filteredMarkers = filterData(filteredKhs, arrayCheckboxes)
    setFilteredHospitalMarker(filteredMarkers)
    markersHospital = filteredMarkers
    filteredMarkers = []
  })

  // Add an event listener for the routing button
  document.getElementById('button_routing').addEventListener('click', () => {
    endHeatmap()
    const routingButton = document.getElementById('button_routing')
    const messageElement = document.getElementById('message')
    if (routingButtonClicked) {
      // If routing has already started, end it
      endRouting()
      messageElement.textContent = '' // Clear the message
      routingButtonClicked = false
      routingButton.style.backgroundColor = '' // Reset the button color
      routingButton.innerHTML = '<i class="fas fa-route"></i>' // Change the button text to an icon
      routingControl.hide() // Hide the directions
    } else {
      // Start routing
      messageElement.innerHTML = `
      <span style="font-size: 20px;"><strong>Route</strong></span><br>
      Startpunkt: Standort<br>
      Zielpunkt: <span style="color: red;">Wählen Sie ein Krankenhaus auf der Karte aus!</span>
      `
      routingButtonClicked = true
      routingButton.style.backgroundColor = 'red' // Make the button red
      routingButton.innerHTML = '<i class="fas fa-stop"></i>' // Change the button text to a "Stop" icon
      messageElement.style.zIndex = '2000' // Set a higher z-index
      messageElement.style.borderRadius = '10px' // Round the corners
      routingControl.show()
      document.querySelector('.leaflet-routing-container').style.visibility = 'visible' // Show the directions
    }
  })

  document.getElementById('useActiveFilterSwitch').addEventListener('change', () => {
    const useActiveFilterSwitch = document.getElementById('useActiveFilterSwitch')
    const activeHeatmapSwitch = document.getElementById('activeHeatmapSwitch')
    removeHeatMap(map)
    map.removeControl(userLocationMarker)
    markersHospital.forEach(hospitalMarker => {
      map.removeControl(hospitalMarker)
    })
    activeHeatmapSwitch.checked = true
    if (!useActiveFilterSwitch.checked) {
      completeDataHeatmap()
    } else {
      partialDataHeatmap(markersHospital)
    }
  })

  document.getElementById('activeHeatmapSwitch').addEventListener('change', () => {
    const activeHeatmapSwitch = document.getElementById('activeHeatmapSwitch')
    const useActiveFilterSwitch = document.getElementById('useActiveFilterSwitch')
    map.removeControl(userLocationMarker)
    if (activeHeatmapSwitch.checked) {
      markersHospital.forEach(hospitalMarker => {
        map.removeControl(hospitalMarker)
      })
      if (useActiveFilterSwitch.checked) {
        partialDataHeatmap(markersHospital)
      } else {
        completeDataHeatmap()
      }
    } else {
      endHeatmap()
    }
  })

  $(document).ready(function () {
    $('.dropdown-toggle').on('click', function (e) {
      const currentDropdown = $(this).parent()
      if (!currentDropdown[0].classList.contains('dropdown-item-text')) {
        $('.dropdown').not(currentDropdown).removeClass('show')
        $('.dropdown .dropdown-menu').not(currentDropdown.find('.dropdown-menu')).removeClass('show')
      }
    })

    $(document).on('click', function (e) {
      if (!$(e.target).closest('.dropdown').length) {
        $('.dropdown').removeClass('show')
        $('.dropdown .dropdown-menu').removeClass('show')
      }
    })
  })
}

// functions ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @description adds a heatmap to the map that includes the complete hospital dataset
 */
async function completeDataHeatmap () {
  const heatmapData = []
  const completeData = await getData()
  await createCompleteKhsDataset()
  const filter = checkCheckboxes()
  filterIds = {
    filterTypIds: [],
    filterEigentuemerIds: [],
    filterNvIds: [],
    filterSpezIds: []
  }
  filter.forEach(filt => {
    if (filt.value[4] === 'k') {
      filterIds.filterTypIds.push(parseInt(filt.value.match(/\d+/g)[0]))
    } else if (filt.value[4] === 'e') {
      filterIds.filterEigentuemerIds.push(parseInt(filt.value.match(/\d+/g)[0]))
    } else if (filt.value[4] === 'n') {
      filterIds.filterNvIds.push(parseInt(filt.value.match(/\d+/g)[0]))
    } else if (filt.value[4] === 's') {
      filterIds.filterSpezIds.push(parseInt(filt.value.match(/\d+/g)[0]))
    }
  })
  const khsWithSpezArray = turnObjectIntoArray()
  let currentFilteredData
  for (key in filterIds) {
    if (currentFilteredData === undefined) {
      if (filterIds[key].length !== 0 && key === 'filterTypIds') {
        console.log('Typ with all data')
        currentFilteredData = filterTyp(filterIds[key], khsWithSpezArray)
      } else if (filterIds[key].length !== 0 && key === 'filterEigentuemerIds') {
        console.log('Eigentuemer with all data')
        currentFilteredData = filterEigentuemer(filterIds[key], khsWithSpezArray)
      } else if (filterIds[key].length !== 0 && key === 'filterNvIds') {
        console.log('NV with all data')
        currentFilteredData = filterNv(filterIds[key], khsWithSpezArray)
      } else if (filterIds[key].length !== 0 && key === 'filterSpezIds') {
        console.log('Spez with all data')
        currentFilteredData = await filteredSpez(filterIds[key], khsWithSpezArray)
      }
    } else {
      if (filterIds[key].length !== 0 && key === 'filterTypIds') {
        console.log('typ with spezial data')
        currentFilteredData = filterTyp(filterIds[key], currentFilteredData)
      } else if (filterIds[key].length !== 0 && key === 'filterEigentuemerIds') {
        console.log('Eigentuemer with spezial data')
        currentFilteredData = filterEigentuemer(filterIds[key], currentFilteredData)
      } else if (filterIds[key].length !== 0 && key === 'filterNvIds') {
        console.log('Nv with spezial data')
        currentFilteredData = filterNv(filterIds[key], currentFilteredData)
      } else if (filterIds[key].length !== 0 && key === 'filterSpezIds') {
        console.log('Spez with spezial data')
        currentFilteredData = await filteredSpez(filterIds[key], currentFilteredData)
      }
    }
  }
  console.log(currentFilteredData)
  loadKhsMarkerOnMap(currentFilteredData)

  completeData.features.forEach(feat => {
    if (feat.geometry.coordinates[0] !== undefined && feat.geometry.coordinates[1] !== undefined) {
      heatmapData.push([feat.geometry.coordinates[1], feat.geometry.coordinates[0], 1])
    }
  })
  addHeatMap(heatmapData, map)
}

/**
 * @description adds a heatmap to the map that includes the filtered hospital dataset
 */
function partialDataHeatmap (data) {
  const heatmapData = []
  data.forEach(feat => {
    if (feat.getLatLng().lng !== undefined && feat.getLatLng().lat !== undefined) {
      heatmapData.push([feat.getLatLng().lat, feat.getLatLng().lng, 1])
    }
  })
  const radiusHeatmap = (document.getElementById('radiusSlider').value)
  addHeatMap(heatmapData, map, radiusHeatmap)
}

function endHeatmap () {
  document.getElementById('activeHeatmapSwitch').checked = false
  removeHeatMap(map)
  map.addControl(userLocationMarker)
  markersHospital.forEach(hospitalMarker => {
    map.addControl(hospitalMarker)
  })
}

function filterRadius (center, data, dataspez) {
  const filteredData = []
  const hospIDs = []

  console.log(dataspez)
  radius = (document.getElementById('radiusSlider').value) * 1000

  center = L.latLng(center[0], center[1])
  for (let i = 0; i < data.features.length; i++) {
    const coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]
    if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
      const distance = center.distanceTo(coords)
      if (distance <= radius) {
        filteredData.push(data.features[i])
        hospIDs.push(data.features[i].properties.Hospital_ID)
      }
    }
  }

  const start = Date.now()
  for (let i = 0; i < filteredData.length; i++) {
    for (let j = 0; j < dataspez.length; j++) {
      if (filteredData[i].properties.Hospital_ID === dataspez[j][2]) {
        filteredHospSpez.push(dataspez[j])
      }
    }
    // return filteredData
  }

  const end = Date.now()
  const executionTime = end - start
  console.log(`Execution time: ${executionTime} ms`)
  console.log('gefilterte Hospital IDs Spez')
  console.log(filteredHospSpez)

  FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredData
  }
  return FeatureCollection
}

function setFilteredHospitalMarker (markersHospital) {
  for (let i = 0; i < markersHospital.length; i++) {
    map.addControl(markersHospital[i])
  }
}

function checkCheckboxes () {
  const arrayProv = []
  const checkboxes = document.querySelectorAll('.checkbox-group:checked')
  if (checkboxes.length === 0) {
    return null
  } else {
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

function filterData (data, arrayCheckboxes) {
  const markersHospital = []
  for (let i = 0; i < data.features.length; i++) {
    const coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]
    if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
      if (filterOneKh(data.features[i], arrayCheckboxes) === true) {
        const temp = createMarker(data.features[i], coords, hospIcon)
        markersHospital.push(temp)
      }
    }
    // return markersHospital
  }
  return markersHospital
}

function filterOneKh (data, arrayCheckboxes) {
  const match = []
  const selTyp = []
  const selTraeger = []
  const selNv = []
  const selSpez = []
  console.log(data)

  for (let j = 0; j < arrayCheckboxes.length; j++) {
    if (arrayCheckboxes[j].value.includes('typ')) {
      selTyp.push(parseInt(arrayCheckboxes[j].value.match(/\d+/g)[0]))
    }
    if (arrayCheckboxes[j].value.includes('traeger')) {
      selTraeger.push(parseInt(arrayCheckboxes[j].value.match(/\d+/g)[0]))
    }
    if (arrayCheckboxes[j].value.includes('nv')) {
      selNv.push([parseInt(arrayCheckboxes[j].value.match(/\d+/g)[0])])
    }
    if (arrayCheckboxes[j].value.includes('sp')) {
      selSpez.push(parseInt(arrayCheckboxes[j].value.match(/\d+/g)[0]))
    }
  }

  for (let ty = 0; ty < selTyp.length; ty++) {
    for (let tr = 0; tr < selTraeger.length; tr++) {
      for (let nv = 0; nv < selNv.length; nv++) {
        if (data.properties.EinrichtungsTyp === selTyp[ty] &&
            data.properties.Traeger === selTraeger[tr] &&
            checkNv(data.properties, selNv[nv]) &&
            checkSp(data.properties.Hospital_ID, selSpez, filteredHospSpez)
        ) {
          match.push(true)
        } else {
          match.push(false)
        }
      }
    }
  }

  for (let m = 0; m < match.length; m++) {
    if (match[m] === true) {
      return true
    }
  }
  return false
}

function checkSp (hospId, selSpez, filteredHospSpez) {
  console.log('_________________________________')
  console.log('hospId')
  console.log(hospId)
  console.log('selSpez')
  console.log(selSpez)
  console.log('filteredHospSpez')
  filSpezOneHosp = []

  // For Schleife die über alle spezialisierungen iteriert
  for (let i = 0; i < filteredHospSpez.length; i++) {
    // Wenn die Hospital ID der Spezialisierung mit der Hospital ID der Klinik übereinstimmt, wird die Spezialisierung in ein Array gepusht
    if (filteredHospSpez[i][2] === hospId) {
      filSpezOneHosp.push(filteredHospSpez[i])
    }
  }
  console.log(filSpezOneHosp)
  return true
}

function checkNv (data, selNv) {
  const nvName = nvObj[selNv].Name
  const nvValue = nvObj[selNv].Value
  if (nvValue.length === 1) {
    if (data[nvName] === nvValue[0]) {
      return true
    } else {
      return false
    }
  } else {
    for (let i = 0; i < nvValue.length; i++) {
      if (data[nvName] === nvValue[i]) {
        return true
      }
    }
    return false
  }
  // if (selNv === 1) {
  //   if (data.Allgemeine_Notfallversorgung === 1 || data.Allgemeine_Notfallversorgung === 2 || data.Allgemeine_Notfallversorgung === 3) {
  //     return true
  //   }
  // }
  // if (selNv === 2) {
  //   if (data.Spezielle_Notfallversorgung_schwerverletzte === 2) {
  //     return true
  //   }
  // }
  // if (selNv === 3) {
  //   if (data.Spezielle_Notfallversorgung_kinder === 2) {
  //     return true
  //   }
  // }
  // if (selNv === 4) {
  //   if (data.Spezielle_Notfallversorgung_schlaganfall === 2) {
  //     return true
  //   }
  // }
  // if (selNv === 5) {
  //   if (data.Spezielle_Notfallversorgung_Herz === 2) {
  //     return true
  //   }
  // }
  // return false
}

// Funktion muss insgesamt Async sein, da sonst die Daten nicht rechtzeitig geladen werden; wird mit try catch Anweisung ausgeführt (er probiert mit nem response Befehl (Z.173), der den Fetch Teil ansteuert, die Daten zu laden, wenn das nicht klappt, wird der Fehler (Z.178) ausgegeben). Zeile 174 ist nur für die Verarbeitung der Daten zuständig, die in Zeile 173 geladen werden. (Dieser Satz wurde von Copilot vorgeschlagen, so richtig verstehe ich Zeile 173-174 nicht)
async function getData () {
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

async function getDataSpez () {
  const url = 'http://localhost:3000/kh_verzeichnis/spezialisierung'
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

async function getDataSpezNumber () {
  const url = 'http://localhost:3000/kh_verzeichnis/spezialisierungWithNumbers'
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

function clearMarker () {
  // lösche User Position Marker
  userLocationMarker.remove()

  // lösche Hospital Marker
  markersHospital.forEach(hospitalMarker => {
    hospitalMarker.remove()
  })
  markersHospital = []
  filteredKhs = []
  filteredHospSpez = []
}

// function setUserMarker (coords) {
//   userLocationMarker = L.marker(coords, { icon: greenIcon })
//   userLocationMarker.bindPopup('Your Position')
//   map.addControl(userLocationMarker)
// }

// function setHospitalMarker (radius, center) {
//   // const url = 'http://localhost:3000/kh_verzeichnis'
//   center = L.latLng(center[0], center[1])
// }

// --- Hier kommt alles für routing --- //

// Function to update routing
function updateRouting (endPoint) {
  // Check if user_location is defined, routingControl exists and routingButton has been clicked
  if (userLocation && routingControl && routingButtonClicked) {
    routingControl.setWaypoints([
      L.latLng(userLocation), // Start point
      endPoint // End point
    ])
  }
}

function endRouting () {
  if (routingControl) {
    routingControl.setWaypoints([])
  }
}

function setUserMarker (coords) {
  userLocationMarker = L.marker(coords, { icon: greenIcon })
  userLocationMarker.bindPopup('Your Position')
  map.addControl(userLocationMarker)
  userLocation = coords
  updateRouting()
}

function setHospitalMarker (radius, center) {
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

            const markerCoords = coords
            // Add an event listener to the marker
            temp.on('click', function () {
              updateRouting(L.latLng(markerCoords))
              const messageElement = document.getElementById('message')
              messageElement.textContent = '' // Clear the message
            })
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
function createMarker (data, coords, hospIcon) {
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

  // Formatierung der URL zur Webseite
  const websiteUrl = textJson.Website.startsWith('http') ? textJson.Website : 'http://' + textJson.Website || 'N/A'
  const mailtoLink = textJson.Email ? `<a href="mailto:${textJson.Email}">${textJson.Email}</a>` : 'N/A'

  // Erstellen des Markers mit einem Click-Event
  tempMarker = L.marker(coords, { icon: hospIcon }).on('click', function (e) {
    // console.log("Marker geklickt. Routing aktiviert: ", routingButtonClicked);
    if (routingButtonClicked) {
      this.openPopup()
    }
    // Wenn das Routing aktiv ist, passiert nichts (das Popup wird nicht geöffnet).
  }).bindPopup(`
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

/**
   * @description creates a dictionary with all the KHS
   */
async function createDataDict () {
  const data = await getData()
  data.features.forEach(khs => {
    allKhsDict[khs.properties.Adresse_Name_Standort] = khs
  })
}

/**
   * @description handles the event, when the user selects a KHS from the search bar
   * @param {string} selectKhs - the name of the selected KHS
   */
function khsSearchHandler (selectKhs) {
  const coords = [allKhsDict[selectKhs].geometry.coordinates[1], allKhsDict[selectKhs].geometry.coordinates[0]]
  map.setView(coords, 13)
  clearMarker()
  setUserMarker(coords)
  setHospitalMarker(10000, coords)
}

/**
   * @description creates a list of all hospitals for the autocomplete function
   */
async function createAutocomplete () {
  // eventuell kann noch der Ort als sucherweiterung hinzugefügt werden
  const data = await getData()
  data.features.forEach(khs => {
    allKhsAutocompleteArr.push(khs.properties.Adresse_Name_Standort)
  })

  allKhsAutocompleteArr.forEach(khs => {
    createDatalistOptions(khs)
  })
}

const locationSearch = document.getElementById('locationSearch')
locationSearch.addEventListener('change', () => {
  const khs = locationSearch.value
  khsSearchHandler(khs)
})

createDataDict()
createAutocomplete()

/**
   * shows hospitals on the map
   * executed from indexScript_notfallsuche.js
   * @param {*} hospitals
   */
// eslint-disable-next-line no-unused-vars
function showHospitalOnMap (hospital) {
  clearMarker()
  // Create a marker for the hospital
  const coords = [hospital.geometry.coordinates[1], hospital.geometry.coordinates[0]]
  const temp = createMarker(hospital, coords, hospIcon)
  markersHospital.push(temp)
  // Add an event listener to the marker
  temp.on('click', function () {
    updateRouting(L.latLng(coords))
    const messageElement = document.getElementById('message')
    messageElement.textContent = '' // Clear the message
  })
  // create markert for user location
  const userLocation = document.getElementById('userLocationField').value
  const userLocationObj = JSON.parse(userLocation)
  const userLocationCoords = [userLocationObj.lat, userLocationObj.lon]
  setUserMarker(userLocationCoords)
  // Add marker to the map
  map.addControl(temp)
  temp.openPopup()
  map.setView(coords, 13)
  // TODO: add routing
}

/**
 * @description creates a dictionary with all the Hospitals
 */
async function createCompleteKhsDataset () {
  khs = await getData()
  khsSpez = await getDataSpezNumber()
  khsSpez.forEach(spez => {
    if (typeof spez.ID === 'string') {
      const spezId = parseInt(spez.ID.substring(2))
      if (khs.features[spezId]) {
        if (spezId === (khs.features[spezId].properties.ObjectID - 1)) {
          if (spez.Spezialisierung !== 'INSG') {
            // const spezName = spez[3].replace(/_/g, ' ')
            if (khs.features[spezId].specialisation) {
              khs.features[spezId].specialisation.push(spez.Spezialisierung)
            } else {
              khs.features[spezId].specialisation = [spez.Spezialisierung]
            }
          }
        }
      }
    }
  })
  khsWithSpez = khs
}

function filterTyp (selectedFilter, data) {
  const selectedKhsTyp = []
  data.forEach(khs => {
    selectedFilter.forEach(filter => {
      if (khs.properties.EinrichtungsTyp === filter) {
        selectedKhsTyp.push(khs)
      }
    })
  })
  return selectedKhsTyp
}

function filterEigentuemer (selectedFilter, data) {
  const selectedKhsEigentuemer = []
  data.forEach(khs => {
    selectedFilter.forEach(filter => {
      if (khs.properties.Traeger === filter) {
        selectedKhsEigentuemer.push(khs)
      }
    })
  })
  return selectedKhsEigentuemer
}

function filterNv (selectedFilter, data) {
  const selectedKhsNv = []
  data.forEach(khs => {
    for (let i = 0; i < selectedFilter.length; i++) {
      const filter = selectedFilter[i]
      if (nvObj[filter].Name === 'Allgemeine_Notfallversorgung') {
        nvObj[filter].Value.forEach(value => {
          if (value === khs.properties[nvObj[filter].Name]) {
            selectedKhsNv.push(khs)
            i = selectedFilter.length
          }
        })
      } else {
        if (khs.properties[nvObj[filter].Name] === 2) {
          selectedKhsNv.push(khs)
          i = selectedFilter.length
        }
      }
    }
  })
  return selectedKhsNv
}

async function filteredSpez (selectedFilter, data) {
  const selectedSpez = []
  selectedFilter.forEach((filter, index) => {
    selectedFilter[index] = String(filter)
    if (selectedFilter[index].length === 3) {
      selectedFilter[index] = '0' + selectedFilter[index]
    } else if (selectedFilter[index].length === 5) {
      selectedFilter[index] = selectedFilter[index].substring(0, 2) + selectedFilter[index].substring(3, 5)
    } else if (selectedFilter[index].length === 4 && selectedFilter[index][1] === '0') {
      selectedFilter[index] = '0' + selectedFilter[index].substring(0, 2) + selectedFilter[index].substring(3, 4)
    }
  })
  data.forEach(khs => {
    if (khs.specialisation) {
      for (let i = 0; i < khs.specialisation.length; i++) {
        selectedFilter.forEach(filter => {
          if (filter === khs.specialisation[i]) {
            selectedSpez.push(khs)
            i = khs.specialisation.length
            console.log('Hinzugefügt')
          }
        })
      }
    }
  })
  console.log(selectedSpez)
  return selectedSpez
}

function turnObjectIntoArray () {
  khsWithSpezArray = []
  khsWithSpez.features.forEach(khs => {
    khsWithSpezArray.push(khs)
  })
  return khsWithSpezArray
}

function reverseSchwerpunkte () {
  return new Promise((resolve, reject) => {
    try {
      const khsSchwerpunkteReverse = Object.fromEntries(
        Object.entries(khsSpezialisierung.Schwerpunkte).map(([key, value]) => [value, key])
      )
      resolve(khsSchwerpunkteReverse)
    } catch (error) {
      reject(error)
    }
  })
}

function loadKhsMarkerOnMap (data) {
  markersHospital = []
  const radius = (parseInt(document.getElementById('radiusSlider').value) * 1000)
  userCoords = [userLocationMarker.getLatLng().lat, userLocationMarker.getLatLng().lng]
  const center = L.latLng(userCoords[0], userCoords[1])

  data.forEach(khs => {
    const coords = [khs.geometry.coordinates[1], khs.geometry.coordinates[0]]
    if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
      const distance = center.distanceTo(coords)
      if (distance <= radius) {
        const temp = createMarker(khs, coords, hospIcon)
        markersHospital.push(temp)
        const markerCoords = coords
        // Add an event listener to the marker
        temp.on('click', function () {
          updateRouting(L.latLng(markerCoords))
          const messageElement = document.getElementById('message')
          messageElement.textContent = '' // Clear the message
        })
      }
    }
  })

  markersHospital.forEach(hospitalMarker => {
    map.addControl(hospitalMarker)
  })
}
