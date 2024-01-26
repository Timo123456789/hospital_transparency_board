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
  // Get the computed styles
  const horizontalDisplayStyle = window.getComputedStyle(document.getElementById('notfallsuche')).display
  const verticalDisplayStyle = window.getComputedStyle(document.getElementById('notfallsuchev')).display
  // Check which group is visible
  if (horizontalDisplayStyle !== 'none') {
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
  } else if (verticalDisplayStyle !== 'none') {
    if (document.getElementById('btnradio1v').checked) {
      query = 'Allgemeine_Notfallversorgung'
      search = 1
    } else if (document.getElementById('btnradio2v').checked) {
      // Allgemeine stationäre Notfallversorgung
      query = 'Spezielle_Notfallversorgung_schwerverletzte'
      search = 1
    } else if (document.getElementById('btnradio3v').checked) {
      // Allgemeine stationäre Notfallversorgung
      query = 'Spezielle_Notfallversorgung_kinder'
      search = 1
    } else if (document.getElementById('btnradio4v').checked) {
      // Allgemeine stationäre Notfallversorgung
      query = 'Spezielle_Notfallversorgung_schlaganfall'
      search = 1
    } else if (document.getElementById('btnradio5v').checked) {
      // Allgemeine stationäre Notfallversorgung
      query = 'Spezielle_Notfallversorgung_Herz'
      search = 1
    }
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
  table.setAttribute('class', 'table table-striped table-hover')
  const thead = document.createElement('thead') // Create thead element
  const tbody = document.createElement('tbody')
  // Create header row
  const headerRow = document.createElement('tr')
  headerRow.setAttribute('class', '')
  // Create header name
  const headerCellName = document.createElement('th')
  const headerCellNameText = document.createTextNode('Krankenhaus')
  headerCellName.appendChild(headerCellNameText)
  headerRow.appendChild(headerCellName)
  // Create header distance
  const headerCellDistance = document.createElement('th')
  const headerCellDistanceText = document.createTextNode('Entfernung')
  headerCellDistance.appendChild(headerCellDistanceText)
  headerRow.appendChild(headerCellDistance)
  // Append header row to thead
  thead.appendChild(headerRow)
  // Append thead to table
  table.appendChild(thead)
  result.forEach(hospital => {
    const row = document.createElement('tr')
    row.setAttribute('class', '')
    row.setAttribute('data-bs-dismiss', 'offcanvas')
    row.setAttribute('aria-label', 'Close')
    row.onclick = function () {
      const offcanvas = document.getElementById('offcanvasBottom')
      offcanvas.classList.remove('open')
      // function from indexScript_main.js
      // eslint-disable-next-line no-undef
      showHospitalOnMap(hospital)
    }
    // name
    const cellName = document.createElement('td')
    const cellNameText = document.createTextNode(hospital.properties.Adresse_Name_Standort)
    cellName.appendChild(cellNameText)
    row.appendChild(cellName)
    // distance
    const cellDistance = document.createElement('td')
    const cellDistanceText = document.createTextNode(hospital.distance.toFixed(2) + ' km')
    cellDistance.appendChild(cellDistanceText)
    row.appendChild(cellDistance)
    // append row to table
    tbody.appendChild(row)
  })
  table.appendChild(tbody)
  notfallsucheTable.appendChild(table)
}

async function notfallsuche () {
  const { query, search } = getQueryString()
  const userLocation = document.getElementById('userLocationField').value
  if (userLocation === '') {
    alert('Bitte lassen Sie Ihren Standort ermitteln.')
    return
  }
  const userLocationParsed = JSON.parse(userLocation)
  const result = await queryData(query, search, userLocationParsed)
  writeTable(result)
}

// -------------------- Event Listener --------------------
/**
 * Event Listener for radio buttons
 */
document.getElementById('notfallsuche').addEventListener('change', function () {
  notfallsuche()
})

document.getElementById('notfallsuchev').addEventListener('change', async function () {
  notfallsuche()
})
