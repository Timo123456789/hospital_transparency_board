// Arrays for the dropdown menus
const khsTypes = ['Hochschulklinik', 'Plankrankenhaus', 'Krankenhaus mit Versorgungsvertrag', 'Krankenhaus ohne Versorgungsvertrag', 'Bundeswehrkrankenhaus']
const khsOwner = ['Öffentlich', 'Freigemeinnützig', 'Privat']
const khsNotfall = ['Allgemeine stationäre Notfallversorgung', 'Schwerverletztenversorgung', 'Notfallversorgung Kinder', 'Schlaganfallversorgung', 'Durchblutungsstörungen des Herzens']
const khsSpezialisierung = {
  Schwerpunkte: {
    2: 'Schwerpunkt Geriatrie',
    3: 'Schwerpunkt Kardiologie',
    4: 'Schwerpunkt Nephrologie',
    5: 'Schwerpunkt Härmatologie',
    6: 'Schwerpunkt Endokrinologie',
    7: 'Schwerpunkt Gastroenterologie',
    8: 'Schwerpunkt Pneumologie',
    9: 'Schwerpunkt Rheumatologie',
    10: 'Schwerpunkt Pädriatrie',
    11: 'Schwerpunkt Kinderkardiologie',
    12: 'Schwerpunkt Neonatologie',
    13: 'Schwerpunkt Kinderchirurgie',
    14: 'Schwerpunkt Lungen- und Bronchialheilkunde',
    15: 'Schwerpunkt Chirurgie',
    16: 'Schwerpunkt Allgemeine Unfallchirurgie',
    17: 'Schwerpunkt Neurochirurgie',
    18: 'Schwerpunkt Gefäßchirurgie',
    19: 'Schwerpunkt Plastische Chirurgie',
    20: 'Schwerpunkt Thoraxchirurgie',
    21: 'Schwerpunkt Herzchirurgie',
    22: 'Schwerpunkt Urologie',
    23: 'Schwerpunkt Orthopädie',
    24: 'Schwerpunkt Frauenheilkunde',
    25: 'Frauenheilkunde',
    26: 'Schwerpunkt Hals-Nasen-Ohrenheilkunde',
    28: 'Schwerpunkt Kinderneurologie',
    30: 'Schwerpunkt Kinder- und Jugendpsychiatrie',
    31: 'Schwerpunkt Psychosomatik',
    33: 'Schwerpunkt Strahlenheilkunde',
    36: 'Intensivmedizin',
    50: 'Schwerpunkt Tumorforschung',
    51: 'Schwerpunkt Coloproktologie',
    52: 'Schwerpunkt Infektionskrankheiten',
    53: 'Schwerpunkt Diabetes',
    54: 'Schwerpunkt Naturheilkunde',
    55: 'Schwerpunkt Gerontopsychiatrie',
    56: 'Schwerpunkt Schlaganfallpatienten',
    57: 'Viszeralmedizin',
    58: 'Weaningeinheit',
    60: 'Tagesklinik',
    61: 'Nachtklinik'
  },
  'Innere Medizin': [100, 2, 3, 4, 5, 6, 7, 8, 9, 14, 50, 51, 52, 53, 54, 56],
  Geriatrie: [200, 24, 60, 61],
  Kardiologie: [300],
  Nephrologie: [400, 10, 36],
  'Hämatologie & Onkologie': [500, 24, 33],
  Endokrinologie: [600, 7, 10],
  Gastroenterologie: [700, 6, 10],
  Pneumologie: [800],
  Rheumatologie: [900, 10],
  Pädiatrie: [1000, 4, 5, 6, 7, 9, 11, 12, 14, 28, 50, 51],
  Kinderkardiologie: [1100, 36],
  Neonatologie: [1200],
  Kinderchirurgie: [1300],
  'Lungen- und Bronchialheilkunde': [1400, 10],
  'Allgemeine Chirugie': [1500, 13, 16, 18, 19, 20, 23, 36, 50, 51],
  Unfallchirurgie: [1600],
  Neurochirurgie: [1700],
  Gefäßchirurgie: [1800],
  'Plastische Chirurgie': [1900],
  Thoraxchirurgie: [2000, 21, 36, 50],
  Herzchirurgie: [2100, 18, 20, 36, 50],
  Urlogie: [2200],
  Orthopädie: [2300, 9, 15, 16],
  Frauenheilkunde: [2400, 2, 5, 6, 25],
  Geburtshilfe: [2500],
  'Hals-Nasen-Ohrenheilkunde': [2600],
  Augenheilkunde: [2700],
  Neurologie: [2800, 10, 51, 52, 56],
  'Allgemeine Psychiatrie': [2900, 28, 30, 31, 50, 51, 52, 53, 54, 55, 56, 60, 61],
  'Kinder- und Jugendpsychiatrie': [3000, 60, 61],
  Psychosomatik: [3100, 10, 60, 61],
  Nuklearmedizin: [3200, 33],
  Strahlenheilkunde: [3300, 5, 50],
  Dermaotlogie: [3400, 60],
  'Mund-Kiefer-Gesichtschirurgie': [3500],
  Intensivmedizin: [3600, 1, 3, 10, 17, 18, 21, 22, 24, 26, 28, 50, 51, 52],
  'Sonstige Fachabteilungen': [3700, 50, 51, 52, 53, 54, 55, 56, 57, 58]
}

// DOM Elements for the dropdown menus
const dropdownKhsTyp = document.getElementById('dropdown-menu-krankenhaus-typ')
const dropdownKhsEigentuemer = document.getElementById('dropdown-menu-eigentuemer-typ')
const dropdownKhsNotfall = document.getElementById('dropdown-menu-notfall-typ')
const dropdownKhsSpezialisierung = document.getElementById('dropdown-menu-spezialisierung-typ')

// DOM Elements for the dropdown menu counters
const khsTypCount = document.getElementById('khs_typ_count')
const khsEigentuemerCount = document.getElementById('khs_eigentuemer_count')
const khsNotfallCount = document.getElementById('khs_notfall_count')
const khsSpezialisierungCount = document.getElementById('khs_spezialisierung_count')

// DOM Element for the datalist
const datalist = document.getElementById('allKHS')

/**
 * @description Create a dropdown menu with checkboxes
 * @param {String} inputID
 * @param {Array} types
 * @param {DOMElement} parentElement
 * @param {DomElement} countElement
 * @param {String} countElementCounter
 */
function createDropdown (inputID, types, parentElement, countElement, countElementCounter) {
  let key
  for (let i = 0; i < types.length; i++) {
    const li = document.createElement('li')
    li.className = 'dropdown-item-text'

    const input = document.createElement('input')
    input.id = inputID + (i + 1)
    input.className = 'btn-check checkbox-group'
    input.type = 'checkbox'
    input.autocomplete = 'off'

    input.addEventListener('click', () => {
      countElement.textContent = '[' + document.querySelectorAll('#' + countElementCounter + ' input:checked').length + ']'
    })

    const label = document.createElement('label')
    label.id = 'dropdown-filter-button'
    label.className = 'btn btn-outline-primary'
    label.htmlFor = inputID + (i + 1)
    if (typeof types[i] === 'number') {
      if (types[i] < 100) {
        label.textContent = khsSpezialisierung.Schwerpunkte[types[i]]
      } else {
        for (key in khsSpezialisierung) {
          if (key !== 'Schwerpunkte') {
            if (khsSpezialisierung[key].includes(types[i])) {
              label.textContent = key
            }
          }
        }
      }
    } else {
      label.textContent = types[i]
    }

    li.appendChild(input)
    li.appendChild(label)
    parentElement.appendChild(li)
  }
}

/**
 * @description Create a interlaced dropdown menu with checkboxes
 * @param {String} inputID
 * @param {Array} types
 * @param {DOMElement} parentElement
 * @param {DomElement} countElement
 * @param {String} countElementCounter
 */
function createInterlacedDropdown (inputID, types, parentElement, countElement, countElementCounter) {
  let counter = 0
  let key
  for (key in types) {
    if (key !== 'Schwerpunkte') {
      if (types[key].length !== 1) {
        const li = document.createElement('li')
        li.className = 'dropdown-item-text'
        li.id = 'list' + (types[key][0] / 100)
        parentElement.appendChild(li)
        const liParent = document.getElementById(li.id)

        const button = document.createElement('button')
        button.className = 'btn btn-primary dropdown-toggle interlacedDropwdown'
        button.id = 'collapse-special' + (types[key][0] / 100)
        button.type = 'button'
        button.setAttribute('data-bs-toggle', 'collapse')
        button.setAttribute('data-bs-target', '#collapse' + (types[key][0] / 100))
        button.setAttribute('aria-expanded', 'false')
        button.setAttribute('aria-controls', ('collapse' + (types[key][0] / 100)))
        button.textContent = (types[key][0] / 100) + '. ' + key
        liParent.appendChild(button)

        const div = document.createElement('div')
        div.id = 'collapse' + (types[key][0] / 100)
        div.className = 'collapse collapse-color'
        parentElement.appendChild(div)
        const divParent = document.getElementById('collapse' + (types[key][0] / 100))

        const divLower = document.createElement('div')
        divLower.className = 'card card-body'
        divLower.id = 'card-body' + (types[key][0] / 100)
        divParent.appendChild(divLower)
        const divLowerParent = document.getElementById('card-body' + (types[key][0] / 100))

        const ul = document.createElement('ul')
        ul.classList = 'no-padding'
        ul.id = 'dropdown-menu-spezialisierung-typ' + (types[key][0] / 100)
        divLowerParent.appendChild(ul)
        const ulParent = document.getElementById('dropdown-menu-spezialisierung-typ' + (types[key][0] / 100))

        createDropdown(('btn-spezailisierung-dropdown' + (parseInt(types[key][0]))), types[key], ulParent, countElement, countElementCounter)
      } else {
        const li = document.createElement('li')
        li.className = 'dropdown-item-text'

        const input = document.createElement('input')
        input.id = inputID + types[key]
        input.className = 'btn-check checkbox-group'
        input.type = 'checkbox'
        input.autocomplete = 'off'

        input.addEventListener('click', () => {
          countElement.textContent = '[' + document.querySelectorAll('#' + countElementCounter + ' input:checked').length + ']'
        })

        const label = document.createElement('label')
        label.id = 'dropdown-filter-button'
        label.className = 'btn btn-outline-primary'
        label.htmlFor = inputID + types[key]
        label.textContent = (types[key] / 100) + '. ' + key

        li.appendChild(input)
        li.appendChild(label)
        parentElement.appendChild(li)
      }
    }
    counter++
  }
}

/**
 * @description Creates the options for the datalist which is used for the autocomplete search
 * @param {*} khs
 */
// eslint-disable-next-line no-unused-vars
function createDatalistOptions (khs) {
  const option = document.createElement('option')
  option.value = khs
  datalist.appendChild(option)
}

// Create dropdowns for each filter
createDropdown('btn-krankenhaus-typ', khsTypes, dropdownKhsTyp, khsTypCount, 'dropdown-menu-krankenhaus-typ')
createDropdown('btn-eigentuemer-typ', khsOwner, dropdownKhsEigentuemer, khsEigentuemerCount, 'dropdown-menu-eigentuemer-typ')
createDropdown('btn-nv', khsNotfall, dropdownKhsNotfall, khsNotfallCount, 'dropdown-menu-notfall-typ')
createInterlacedDropdown('btn-spezialisierung-', khsSpezialisierung, dropdownKhsSpezialisierung, khsSpezialisierungCount, 'dropdown-menu-spezialisierung-typ')
