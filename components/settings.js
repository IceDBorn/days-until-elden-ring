import store from '../store.js'

// Load and parse HTML
export const html = await window.fetch('/components/settings.html')
  .then(res => res.text())
  .then(res => {
    const html = document.createElement('body')
    html.innerHTML = res
    return html.querySelector('template').innerHTML
  })

// Declare component
const SwalPopup = window.Vue.extend({
  template: html,
  data () {
    return store
  },
  computed: {
    formattedSparksTick () {
      const formattedValue = parseFloat(2.33 - 0.0663333 * (-this.settings.sparksTick) + '').toFixed(2) + 'x'
      document.getElementById('sparksTickValue').innerText = formattedValue
      return formattedValue
    },
    formattedSparksSpeed () {
      const formattedValue = parseFloat(2.28262 - 0.0355357 * (-this.settings.sparksSpeed) + '').toFixed(2) + 'x'
      document.getElementById('sparksSpeedValue').innerText = formattedValue
      return formattedValue
    }
  }
})

// Render component on #swal
export const mountSwal = () => new SwalPopup().$mount('#swal-settings')
