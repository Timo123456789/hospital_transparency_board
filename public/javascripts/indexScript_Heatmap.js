let heatmap

/**
 * @description adds a heatmap to the current map based on the given data
 * @param {Array} data
 * @param {LeafletMap} map
 */
// eslint-disable-next-line no-unused-vars
function addHeatMap (data, map) {
  // eslint-disable-next-line no-undef
  heatmap = L.heatLayer(data, {
    radius: 50,
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
// eslint-disable-next-line no-unused-vars
function removeHeatMap (map) {
  if (heatmap) {
    map.removeLayer(heatmap)
  }
}
