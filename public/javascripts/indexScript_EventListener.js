// Event Listener for radius slider
const radiusSlider = document.getElementById('radiusSlider')
const radiusInput = document.getElementById('radiusInput')

// Update the input field when the slider value changes
radiusSlider.addEventListener('input', function (e) {
  radiusInput.value = e.target.value
})

// Update the slider when the input field value changes
radiusInput.addEventListener('input', function (e) {
  radiusSlider.value = e.target.value
})

// Event Listener for rating slider
// const ratingSlider = document.getElementById('ratingSlider')
// const ratingInput = document.getElementById('ratingInput')

// Update the input field when the slider value changes
// ratingSlider.addEventListener('input', function (e) {
//   ratingInput.value = e.target.value
// })

// Update the slider when the input field value changes
// ratingInput.addEventListener('input', function (e) {
//   ratingSlider.value = e.target.value
// })
