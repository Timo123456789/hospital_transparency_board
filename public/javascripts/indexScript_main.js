/* eslint-disable no-undef */
let khsWithSpez
let userLocationMarker = null
let userLocation
let markersHospital = []
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
  map = L.map('map', { zoomControl: false }).setView([51.3526, 10.0622], 7)
  // map.panTo(new L.LatLng(51.9607, 7.6261))
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

  // event listener ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  document.getElementById('button_getUserLoc').addEventListener('click', async function () {
    showLoader()
    if (userLocationMarker !== null && markersHospital !== null) {
      endHeatmap()
      clearMarker()
      // lösche User Position Marker
      userLocationMarker.remove()
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async function (position) {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        coords = [lat, lng]
        document.getElementById('userLocationField').value = '{"lat":' + coords[0] + ', "lon":' + coords[1] + '}'
        map.flyTo(coords, 13)
        setUserMarker(coords)
        filterFunction()
        hideLoader()
      }, function (error) {
        console.error('Fehler beim Abrufen der Position:', error)
      })
    } else {
      console.log('Geolocation wird von Ihrem Browser nicht unterstützt')
    }
  })

  document.getElementById('button_setMarker').addEventListener('click', async function () {
    if (userLocationMarker !== null && markersHospital !== null) {
      endHeatmap()
      clearMarker()
      // lösche User Position Marker
      userLocationMarker.remove()
    }
    map.once('click', function (e) {
      coords = [e.latlng.lat, e.latlng.lng]
      document.getElementById('userLocationField').value = '{"lat":' + coords[0] + ', "lon":' + coords[1] + '}'
      map.flyTo(coords, 13)
      setUserMarker(coords)
      filterFunction()
    })
  })

  // Funktion muss Async sein, da sonst die Daten nicht rechtzeitig geladen werden (s. Z. 109, Col 68 )
  // Await muss in Zeile 131 eingesetzt werden damit auf die Rückgabe vom Server gewartet wird (sonst ist die Variable leer/undefined)
  document.getElementById('button_submit').addEventListener('click', async function () {
    if (userLocationMarker !== null && markersHospital !== null) {
      endHeatmap()
      clearMarker()
    }
    filterFunction()
  })

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
    const routingButton = document.getElementById('button_routing')
    endRouting()
    routingButton.style.backgroundColor = '' // Reset the button color
    routingButton.innerHTML = '<i class="fas fa-route"></i>' // Change the button text to an icon
    routingControl.hide() // Hide the directions
    removeHeatMap(map)
    if (userLocationMarker) {
      map.removeControl(userLocationMarker)
    }
    if (markersHospital !== null) {
      markersHospital.forEach(hospitalMarker => {
        map.removeControl(hospitalMarker)
      })
    }
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
    const routingButton = document.getElementById('button_routing')
    endRouting()
    routingButton.style.backgroundColor = '' // Reset the button color
    routingButton.innerHTML = '<i class="fas fa-route"></i>' // Change the button text to an icon
    routingControl.hide() // Hide the directions
    if (userLocationMarker) {
      map.removeControl(userLocationMarker)
    }
    if (activeHeatmapSwitch.checked) {
      if (markersHospital !== null) {
        markersHospital.forEach(hospitalMarker => {
          map.removeControl(hospitalMarker)
        })
      }
      if (useActiveFilterSwitch.checked) {
        partialDataHeatmap(markersHospital)
      } else {
        completeDataHeatmap()
      }
    } else {
      endHeatmap()
    }
  })

  document.getElementById('btnGoToFilter').addEventListener('click', () => {
    const offcanvasLeft = document.getElementById('offcanvasLeft')
    const offcanvasEnd = document.getElementById('offcanvasEnd')
    const bsOffcanvasLeft = new bootstrap.Offcanvas(offcanvasLeft)
    const bsOffcanvasEnd = bootstrap.Offcanvas.getInstance(offcanvasEnd)

    if (bsOffcanvasEnd) {
      bsOffcanvasEnd.hide()
    }
    bsOffcanvasLeft.show()
  })

  document.getElementById('locationSearch').addEventListener('change', () => {
    const khs = locationSearch.value
    khsSearchHandler(khs)
  })

  document.getElementById('button_reset').addEventListener('click', () => {
    const dropdownItems = document.querySelectorAll('.checkbox-group:checked')
    dropdownItems.forEach(item => {
      item.checked = false
    })
    countArray.forEach(count => {
      count.textContent = '[0]'
    })
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

// These two functions are used to create the options for the datalist which is used for the autocomplete search
createDataDict()
createAutocomplete()

/**
 * @description is the main function which get called when a filtering should be performed. All other functions are called from here.
 */
async function filterFunction () {
  await createCompleteKhsDataset()
  const filter = checkCheckboxes()
  const khsWithSpezArray = turnObjectIntoArray()
  filterIds = {
    filterTypIds: [],
    filterEigentuemerIds: [],
    filterNvIds: [],
    filterSpezIds: []
  }
  if (filter === null) {
    loadKhsMarkerOnMap(khsWithSpezArray)
  } else {
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
    let currentFilteredData
    for (key in filterIds) {
      if (currentFilteredData === undefined) {
        if (filterIds[key].length !== 0 && key === 'filterTypIds') {
          currentFilteredData = await filterTyp(filterIds[key], khsWithSpezArray)
        } else if (filterIds[key].length !== 0 && key === 'filterEigentuemerIds') {
          currentFilteredData = await filterEigentuemer(filterIds[key], khsWithSpezArray)
        } else if (filterIds[key].length !== 0 && key === 'filterNvIds') {
          currentFilteredData = await filterNv(filterIds[key], khsWithSpezArray)
        } else if (filterIds[key].length !== 0 && key === 'filterSpezIds') {
          currentFilteredData = await filteredSpez(filterIds[key], khsWithSpezArray)
        }
      } else {
        if (filterIds[key].length !== 0 && key === 'filterTypIds') {
          currentFilteredData = await filterTyp(filterIds[key], currentFilteredData)
        } else if (filterIds[key].length !== 0 && key === 'filterEigentuemerIds') {
          currentFilteredData = await filterEigentuemer(filterIds[key], currentFilteredData)
        } else if (filterIds[key].length !== 0 && key === 'filterNvIds') {
          currentFilteredData = await filterNv(filterIds[key], currentFilteredData)
        } else if (filterIds[key].length !== 0 && key === 'filterSpezIds') {
          currentFilteredData = await filteredSpez(filterIds[key], currentFilteredData)
        }
      }
    }
    loadKhsMarkerOnMap(currentFilteredData)
  }
}

/**
 * @description collects all selected filter options and returns them as an array
 * @returns {Array} khsWithSpezArray
 */
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

// Funktion muss insgesamt Async sein, da sonst die Daten nicht rechtzeitig geladen werden;
// wird mit try catch Anweisung ausgeführt (er probiert mit nem response Befehl (Z.173),
// der den Fetch Teil ansteuert, die Daten zu laden, wenn das nicht klappt, wird der Fehler (Z.178) ausgegeben).
// Zeile 174 ist nur für die Verarbeitung der Daten zuständig, die in Zeile 173 geladen werden.
// (Dieser Satz wurde von Copilot vorgeschlagen, so richtig verstehe ich Zeile 173-174 nicht)
/**
 * @description reads the hospital data from the server
 * @returns {Array} data
 */
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

/**
 * @description reads the hospital specialisation data from the server
 * @returns {Array} data
 */
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

/**
 * @description removes the markers from the map
 */
function clearMarker () {
  // lösche Hospital Marker
  markersHospital.forEach(hospitalMarker => {
    hospitalMarker.remove()
  })
  markersHospital = []
}

/**
 * @description updates the routing to a new end point
 * @param {Object} endPoint
 */
function updateRouting (endPoint) {
  // Check if user_location is defined, routingControl exists and routingButton has been clicked
  if (userLocation && routingControl && routingButtonClicked) {
    routingControl.setWaypoints([
      L.latLng(userLocation), // Start point
      endPoint // End point
    ])
  }
}

/**
 * @description closes the routing
 */
function endRouting () {
  if (routingControl) {
    routingControl.setWaypoints([])
  }
}

/**
 * @description sets the user marker on the map
 * @param {Array} coords
 */
function setUserMarker (coords) {
  userLocationMarker = L.marker(coords, { icon: greenIcon })
  userLocationMarker.bindPopup('Your Position')
  map.addControl(userLocationMarker)
  userLocation = coords
  updateRouting()
}

/**
 * @description sets the hospital marker on the map
 * @param {Number} radius
 * @param {Array} center
 */
// eslint-disable-next-line no-unused-vars
function setHospitalMarker (radius, center) {
  const url = 'http://localhost:3000/kh_verzeichnis'
  center = L.latLng(center[0], center[1])
  fetch(url)
    .then(response => response.text())
    .then(data => {
      data = JSON.parse(data)
      for (let i = 0; i < data.features.length; i++) {
        const coords = [data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]]
        if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
          const distance = center.distanceTo(coords)
          if (distance <= radius) {
            const temp = createMarker(data.features[i], coords, hospIcon)
            markersHospital.push(temp)
            const markerCoords = coords
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

/**
 * @description creates a marker for a hospital
 * @param {*} data
 * @param {Array} coords
 * @param {Object} hospIcon
 * @returns {Object} Marker
 */
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

  let websiteUrl = 'N/A'
  let mailtoLink = 'N/A'
  if (textJson.Website) {
    websiteUrl = textJson.Website.startsWith('http') ? textJson.Website : 'http://' + textJson.Website || 'N/A'
  }
  if (textJson.Email) {
    mailtoLink = textJson.Email ? `<a href="mailto:${textJson.Email}">${textJson.Email}</a>` : 'N/A'
  }
  tempMarker = L.marker(coords, { icon: hospIcon }).on('click', function (e) {
    if (routingButtonClicked) {
      this.openPopup()
    }
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

/**
 * @description decodes the received value for the owner
 * @param {*} value
 * @returns {String} the decoded value
 */
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

/**
 * @description decodes the received value for the type
 * @param {*} value
 * @returns {String} the decoded value
 */
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
  clearMarker()
  document.getElementById('userLocationField').value = '{"lat":' + coords[0] + ', "lon":' + coords[1] + '}'
  showHospitalOnMap(allKhsDict[selectKhs])
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
  // Add marker to the map
  map.addControl(temp)
  temp.openPopup()
  zoomToHospitals()
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

/**
 * @description filters the hospitals according to the selected typ
 * @param {Array} selectedFilter
 * @param {Array} data
 * @returns {Array} the hosptials of the input that fit the selected typ
 */
async function filterTyp (selectedFilter, data) {
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

/**
 * @description filters the hospitals according to the selected owner
 * @param {Array} selectedFilter
 * @param {Array} data
 * @returns {Array} the hosptials of the input that fit the selected owner
 */
async function filterEigentuemer (selectedFilter, data) {
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

/**
 * @description filters the hospitals according to the selected notfallsversorgung
 * @param {Array} selectedFilter
 * @param {Array} data
 * @returns {Array} the hosptials of the input that fit the selected notfallsversorgung
 */
async function filterNv (selectedFilter, data) {
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

/**
 * @description filters the hospitals according to the selected specialisations
 * @param {Array} selectedFilter
 * @param {Array} data
 * @returns {Array} the hosptials of the input that fit the selected specialisations
 */
async function filteredSpez (selectedFilter, data) {
  const selectedSpez = []
  console.log(selectedFilter)
  selectedFilter.forEach((filter, index) => {
    selectedFilter[index] = String(filter)
    if (selectedFilter[index].length === 3) {
      selectedFilter[index] = '0' + selectedFilter[index]
    } else if (selectedFilter[index].length === 4 && selectedFilter[index][2] === '0' && selectedFilter[index][3] === '1') {
      selectedFilter[index] = String(parseInt(selectedFilter[index]) - 1)
      selectedFilter[index] = '0' + selectedFilter[index].substring(0, 2) + selectedFilter[index].substring(3, 4)
    } else if (selectedFilter[index].length === 4 && selectedFilter[index][2] === '0' && selectedFilter[index][3] === '0') {
      console.log('passt')
    } else if (selectedFilter[index].length === 4 && selectedFilter[index][2] === '0' && selectedFilter[index][3] !== '0') {
      selectedFilter[index] = '0' + selectedFilter[index].substring(0, 2) + selectedFilter[index].substring(3, 4)
    } else if (selectedFilter[index].length === 5 && selectedFilter[index][3] === '0' && selectedFilter[index][4] === '1') {
      selectedFilter[index] = String(parseInt(selectedFilter[index]) - 1)
      selectedFilter[index] = selectedFilter[index].substring(0, 2) + selectedFilter[index].substring(3, 5)
    } else if (selectedFilter[index].length === 5 && selectedFilter[index][3] === '0' && selectedFilter[index][4] !== '0') {
      selectedFilter[index] = selectedFilter[index].substring(0, 2) + selectedFilter[index].substring(3, 5)
    } else if (selectedFilter[index].length === 5 && selectedFilter[index][1] === '0' && selectedFilter[index][2] === '0') {
      selectedFilter[index] = '0' + selectedFilter[index].substring(0, 1) + selectedFilter[index].substring(3, 5)
    } else if (selectedFilter[index].length === 6) {
      selectedFilter[index] = selectedFilter[index].substring(0, 2) + selectedFilter[index].substring(4, 6)
    }
  })
  console.log(selectedFilter)
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

/**
 * @description turns the hopsital object into an array
 * @returns {Array} an array with all the hospitals
 */
function turnObjectIntoArray () {
  khsWithSpezArray = []
  khsWithSpez.features.forEach(khs => {
    khsWithSpezArray.push(khs)
  })
  return khsWithSpezArray
}

/**
 * @description loads the markers of the (filtered) hospitals on the map
 * @param {Array} data
 */
function loadKhsMarkerOnMap (data) {
  markersHospital = []
  if (data.length === 0) {
    alert('Keine Krankenhäuser gefunden')
  } else {
    if (userLocationMarker !== null) {
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
    }
  }
  zoomToHospitals()
  markersHospital.forEach(hospitalMarker => {
    map.addControl(hospitalMarker)
  })
}

/**
 * zooms to hospitals and user location
 */
function zoomToHospitals () {
  if (markersHospital.length === 0) {
    map.flyTo(userCoords, 13)
    alert('Keine Krankenhäuser gefunden!')
  } else {
    // add hospital maker and user location in one array
    const allMarkers = markersHospital
    allMarkers.push(userLocationMarker)
    map.flyToBounds(allMarkers.map(marker => marker.getLatLng()))
  }
}

function showLoader () {
  loader.classList.remove('visually-hidden')
  mapContainer.style.opacity = '0.5'
}

function hideLoader () {
  loader.classList.add('visually-hidden')
  mapContainer.style.opacity = '1'
}
