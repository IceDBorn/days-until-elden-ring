import store from '../store.js'

// Load and parse HTML
export const html = await window.fetch('/components/iframe.html')
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
  mounted() {
    this.$refs.iframe.setAttribute('src', this.iframeUrl)
  }
})

// Render component on #swal
export const mountSwal = () => new SwalPopup().$mount('#iframe')