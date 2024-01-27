/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let heatmap

/**
 * @description adds a heatmap to the current map based on the given data
 * @param {Array} data
 * @param {LeafletMap} map
 */
function addHeatMap (data, map, radius) {
  let rad = parseInt(radius)
  if (radius) {
    if (parseInt(radius) < 50) {
      rad = 50
    }
  } else {
    rad = 50
  }
  heatmap = L.heatLayer(data, {
    radius: rad,
    gradient: {
      0.05: 'blue', 0.2: 'limegreen', 0.275: 'yellow', 0.35: 'orange', 0.425: 'red', 1: 'purple'
    }
  })
  heatmap.addTo(map)
}

/**
 * @description removes the heatmap from the current map
 * @param {LeafletMap} map
 */
function removeHeatMap (map) {
  if (heatmap) {
    map.removeLayer(heatmap)
  }
}

/**
 * @description adds a heatmap to the map that includes the complete hospital dataset
 */
async function completeDataHeatmap () {
  const heatmapData = []
  const completeData = await getData()
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

/**
 * @description removes the heatmap from the map
 */
function endHeatmap () {
  document.getElementById('activeHeatmapSwitch').checked = false
  removeHeatMap(map)
  if (userLocationMarker) {
    map.addControl(userLocationMarker)
  }
  if (markersHospital.length > 0) {
    markersHospital.forEach(hospitalMarker => {
      map.addControl(hospitalMarker)
    })
  }
}
