/**
 * fetches data from files
 * @returns hospitals
 */
async function getData () {
  const url = 'http://localhost:3000/kh_verzeichnis'
  try {
    const response = await fetch(url)
    const data = await response.text()
    return JSON.parse(data)
  } catch (error) {
    console.error('Fehler beim Lesen der Datei:', error)
  }
}

/**
 * defines query and search after radio button selection
 * @returns query and search
 */
function getQueryString () {
  let query = ''
  let search = ''
  // Allgemeine stationäre Notfallversorgung
  if (document.getElementById('btnradio1').checked) {
    query = 'Allgemeine_Notfallversorgung'
    search = 1
  } else if (document.getElementById('btnradio2').checked) {
    // Allgemeine stationäre Notfallversorgung
    query = 'Spezielle_Notfallversorgung_schwerverletzte'
    search = 1
  } else if (document.getElementById('btnradio3').checked) {
    // Allgemeine stationäre Notfallversorgung
    query = 'Spezielle_Notfallversorgung_kinder'
    search = 1
  } else if (document.getElementById('btnradio4').checked) {
    // Allgemeine stationäre Notfallversorgung
    query = 'Spezielle_Notfallversorgung_schlaganfall'
    search = 1
  } else if (document.getElementById('btnradio5').checked) {
    // Allgemeine stationäre Notfallversorgung
    query = 'Spezielle_Notfallversorgung_Herz'
    search = 1
  }
  return { query, search }
}

/**
 * queries data
 * @param {string} query
 * @param {string} search
 * @returns hospitals
 */
async function queryData (query, search, coords) {
  const data = await getData()
  const hospitals = data.features.filter(hospital => {
    return hospital.properties[query] === search
  })
  // order the results after the distance
  const orderedHospitals = orderHospitals(hospitals, coords)
  // return the first 10 results
  return orderedHospitals.slice(0, 10)
}

/**
 * orders hospitals after distance
 * @param {*} hospitals
 * @param {*} coords
 * @returns
 */
function orderHospitals (hospitals, coords) {
  const orderedHospitals = hospitals.map(hospital => {
    const distance = getDistanceFromLatLonInKm(coords.lat, coords.lon, hospital.geometry.coordinates[1], hospital.geometry.coordinates[0])
    hospital.distance = distance
    return hospital
  })
  orderedHospitals.sort((a, b) => {
    return a.distance - b.distance
  })
  return orderedHospitals
}

/**
 * calculates distance between two coordinates
 * @param {*} lat1
 * @param {*} lon1
 * @param {*} lat2
 * @param {*} lon2
 * @returns distance in km
 */
function getDistanceFromLatLonInKm (lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

/**
 * converts degree to radian
 * @param {*} deg
 * @returns radian
 */
function deg2rad (deg) {
  return deg * (Math.PI / 180)
}

function writeTable (result) {
  const notfallsucheTable = document.getElementById('notfallsucheTable')
  notfallsucheTable.innerHTML = ''
  const table = document.createElement('table')
  const thead = document.createElement('thead') // Create thead element
  const tbody = document.createElement('tbody')
  // Create header row
  const headerRow = document.createElement('tr')
  // Create header name
  const headerCell1 = document.createElement('th')
  const headerCellText1 = document.createTextNode('Krankenhaus')
  headerCell1.appendChild(headerCellText1)
  headerRow.appendChild(headerCell1)
  // Create header distance
  const headerCell2 = document.createElement('th')
  const headerCellText2 = document.createTextNode('Entfernung')
  headerCell2.appendChild(headerCellText2)
  headerRow.appendChild(headerCell2)
  thead.appendChild(headerRow) // Append header row to thead
  table.appendChild(thead) // Append thead to table
  result.forEach(hospital => {
    const row = document.createElement('tr')
    // name
    const cell = document.createElement('td')
    const cellText = document.createTextNode(hospital.properties.Adresse_Name_Standort)
    cell.appendChild(cellText)
    row.appendChild(cell)
    // distance
    const cell2 = document.createElement('td')
    const cellText2 = document.createTextNode(hospital.distance.toFixed(2) + ' km')
    cell2.appendChild(cellText2)
    row.appendChild(cell2)
    // button
    const cell3 = document.createElement('td')
    const button = document.createElement('button')
    button.textContent = 'Auf Karte anzeigen'
    button.setAttribute('class', 'btn btn-primary')
    button.setAttribute('data-bs-dismiss', 'offcanvas')
    button.setAttribute('aria-label', 'Close')
    button.onclick = function () {
      const offcanvas = document.getElementById('offcanvasBottom')
      offcanvas.classList.remove('open')
      // function from indexScript_main.js
      // eslint-disable-next-line no-undef
      showHospitalOnMap(hospital)
    }
    cell3.appendChild(button)
    row.appendChild(cell3)
    // append row to table
    tbody.appendChild(row)
  })
  table.appendChild(tbody)
  notfallsucheTable.appendChild(table)
  notfallsucheTable.setAttribute('border', '2')
}

// -------------------- Event Listener --------------------
/**
 * Event Listener for radio buttons
 */
document.getElementById('notfallsuche').addEventListener('change', async function () {
  const { query, search } = getQueryString()
  const userLocation = document.getElementById('userLocationField').value
  if (userLocation === '') {
    alert('Bitte lassen Sie Ihren Standort ermitteln.')
    return
  }
  const userLocationParsed = JSON.parse(userLocation)
  const result = await queryData(query, search, userLocationParsed)
  writeTable(result)
})
