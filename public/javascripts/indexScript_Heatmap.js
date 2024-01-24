// eslint-disable-next-line no-unused-vars
function addHeatMap (data, map) {
  // eslint-disable-next-line no-undef
  L.heatLayer(data, {
    radius: 50,
    gradient: {
      0.05: 'blue', 0.2: 'limegreen', 0.275: 'yellow', 0.35: 'orange', 0.425: 'red', 1: 'purple'
    }
  }).addTo(map)
}
