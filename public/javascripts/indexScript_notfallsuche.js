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
  // Create header show
  const headerCellShow = document.createElement('th')
  const headerCellShowText = document.createTextNode('          ')
  headerCellShow.appendChild(headerCellShowText)
  headerRow.appendChild(headerCellShow)
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
    // button
    const cellButton = document.createElement('td')
    const button = document.createElement('button')
    button.setAttribute('class', 'btn btn-primary')
    button.setAttribute('data-bs-dismiss', 'offcanvas')
    button.setAttribute('aria-label', 'Close')
    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgIcon.setAttribute('width', '16')
    svgIcon.setAttribute('height', '16')
    svgIcon.setAttribute('fill', 'currentColor')
    svgIcon.setAttribute('viewBox', '0 0 16 16')
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute('d', 'M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.3 1.3 0 0 0-.37.265.3.3 0 0 0-.057.09V14l.002.008.016.033a.6.6 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.6.6 0 0 0 .146-.15l.015-.033L12 14v-.004a.3.3 0 0 0-.057-.09 1.3 1.3 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465s-2.462-.172-3.34-.465c-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411')
    svgIcon.appendChild(path1)
    button.appendChild(svgIcon)
    button.onclick = function () {
      const offcanvas = document.getElementById('offcanvasBottom')
      offcanvas.classList.remove('open')
      // function from indexScript_main.js
      // eslint-disable-next-line no-undef
      showHospitalOnMap(hospital)
    }
    cellButton.appendChild(button)
    row.appendChild(cellButton)
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
