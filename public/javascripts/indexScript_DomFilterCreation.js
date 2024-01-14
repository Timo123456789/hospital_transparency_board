// Arrays for the dropdown menus
const khsTypes = ['Hochschulklinik', 'Plankrankenhaus', 'Krankenhaus mit Versorgungsvertrag', 'Krankenhaus ohne Versorgungsvertrag', 'Bundeswehrkrankenhaus']
const khsOwner = ['Privat', 'Öffentlich', 'Freigemeinnützig']
const khsNotfall = ['Allgemeine stationäre Notfallversorgung','Schwerverletztenversorgung','Notfallversorgung Kinder','Schlaganfallversorgung','Durchblutungsstörungen des Herzens']

// DOM Elements for the dropdown menus
const dropdownKhsTyp = document.getElementById('dropdown-menu-krankenhaus-typ')
const dropdownKhsEigentuemer = document.getElementById('dropdown-menu-eigentuemer-typ')
const dropdownKhsNotfall = document.getElementById('dropdown-menu-notfall-typ')

// DOM Elements for the dropdown menu counters
const khsTypCount = document.getElementById('khs_typ_count')
const khsEigentuemerCount = document.getElementById('khs_eigentuemer_count')
const khsNotfallCount = document.getElementById('khs_notfall_count')

// DOM Element for the datalist
const datalist = document.getElementById('allKHS');

/**
 * @description Create a dropdown menu with checkboxes
 * @param {String} inputID 
 * @param {Array} types 
 * @param {DOMElement} parentElement 
 * @param {DomElement} countElement 
 * @param {String} countElementCounter 
 */
function createDropdown(inputID, types, parentElement, countElement, countElementCounter) {
    for (var i = 0; i < types.length; i++) {
        const li = document.createElement('li');
        li.className = 'dropdown-item-text';
      
        const input = document.createElement('input');
        input.id = inputID + (i + 1);
        input.className = 'btn-check';
        input.type = 'checkbox';
        input.autocomplete = 'off';
      
        input.addEventListener('click', () => {
            countElement.textContent = "[" + document.querySelectorAll('#' + countElementCounter + ' input:checked').length + "]";
        });
      
        const label = document.createElement('label');
        label.className = 'btn btn-outline-primary';
        label.htmlFor = inputID + (i + 1);
        label.textContent = types[i];
      
        li.appendChild(input);
        li.appendChild(label);
      
        parentElement.appendChild(li);
      }
}

/**
 * @description Creates the options for the datalist which is used for the autocomplete search
 * @param {*} khs 
 */
function createDatalistOptions(khs){
    const option = document.createElement('option');
    option.value = khs;
    datalist.appendChild(option);
}

// Create dropdowns for each filter
createDropdown("btn-krankenhaus-typ", khsTypes, dropdownKhsTyp, khsTypCount, 'dropdown-menu-krankenhaus-typ')
createDropdown("btn-eigentuemer-typ", khsOwner, dropdownKhsEigentuemer, khsEigentuemerCount, 'dropdown-menu-eigentuemer-typ')
createDropdown("btn-nv", khsNotfall, dropdownKhsNotfall, khsNotfallCount, 'dropdown-menu-notfall-typ')
