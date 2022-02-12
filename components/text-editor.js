import store from '../store.js'

// Load and parse HTML
export const html = await window.fetch('/components/text-editor.html')
  .then(res => res.text())
  .then(res => {
    const html = document.createElement('body')
    html.innerHTML = res
    const component = html.querySelector('template').innerHTML
    return component
  })

// Declare component
const SwalPopup = window.Vue.extend({
  template: html,
  data () {
    return {
      ...store,
      maxTextOpacity: store.settings.maxTextOpacity,
      dropShadowBlur: store.settings.dropShadowBlur
    }
  },
  methods: {
    applyTextStylePreset (defaultPreset) {
      window.app.applyTextStylePreset(defaultPreset)
      this.maxTextOpacity = this.settings.maxTextOpacity
      this.dropShadowBlur = this.settings.dropShadowBlur
    },
    normalizeMinMax (event) {
      console.log(event.code)

      if (['Backspace','Delete','Period','Comma'].includes(event.code)) {
        return false
      }

      const el = event.target
      if (el.value !== '') {
        if (parseFloat(el.value) < parseFloat(el.min)) {
          el.value = el.min
        }
        if (parseFloat(el.value) > parseFloat(el.max)) {
          el.value = el.max
        }
      }

      return true
    },
    setMaxTextOpacity (event) {
      const isNormal = this.normalizeMinMax(event)
      if (isNormal) {
        this.settings.maxTextOpacity = event.target.value
      }
    },
    setDropShadowBlur (event) {
      const isNormal = this.normalizeMinMax(event)
      if (isNormal) {
        this.settings.dropShadowBlur = event.target.value
      }
    }
  }
})

// Render component on #swal
export const mountSwal = () => new SwalPopup().$mount('#swal-editor')
