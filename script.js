;(() => {
  const rand = function (a, b) { return ~~((Math.random() * (b - a + 1)) + a) }

  window.requestAnimFrame = (function () { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) { window.setTimeout(a, 1E3 / 60) } }())

  function setBackground (url, isMobile) {
    document.body.style.background = 'black url(' + url + ')'
    document.body.style.backgroundRepeat = 'no-repeat'

    if (isMobile) {
      document.body.style.backgroundSize = 'auto'
      document.body.style.backgroundPosition = '50% 0%'
      document.body.style.backgroundAttachment = 'scroll'
    } else {
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = '50% 50%'
      document.body.style.backgroundAttachment = 'fixed'
    }
  }

  /* eslint-disable-next-line no-unused-vars */
  const app = new window.Vue({
    el: '#app',
    data: {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      countDownDate: 0,
      today: new Date().getDay(),
      isTouch: false,

      lastFrameTime: Date.now(),

      background: null,
      contentOpacity: 0,

      untilInterval: null,
      untilHtml: '',

      iframeWidth: 0,
      iframeHeight: 0,
      iframeVisible: true,

      bottomHiddenBarVisible: false,

      toastVisible: true,
      toastStyle: {},

      settings: {
        sparksPlaying: true
      }
    },
    mounted () {
      const self = this

      const savedSettings = JSON.parse(window.localStorage.getItem('settings'))
      if (savedSettings) this.settings = savedSettings

      try { document.createEvent('TouchEvent'); this.isTouch = true } catch { this.isTouch = false }
      setTimeout(function () { self.toastVisible = false }, 5000)

      this.initCountDownDate()
      this.initToastStyles()
      this.initBackgroundInterval()
      this.initBottomHiddenBar()

      this.updateBackground()
      this.fadingLoop()
    },
    watch: {
      settings: {
        handler (newSettings) {
          window.localStorage.setItem('settings', JSON.stringify(this.settings))
        },
        deep: true
      },
      'settings.sparksPlaying' (newStatus) {
        console.log(newStatus)
      }
    },
    methods: {
      updateBackground () {
        let url = 'resources/backgrounds/' + this.today + '-' + rand(0, 2) + '.jpg'
        window.fetch(url, { method: 'HEAD' })
          .then(res => {
            if (!res.ok) {
              url = 'resources/backgrounds/' + this.today + '-0.jpg'
            }

            setBackground(url, this.isMobile)
          })
      },
      fadingLoop () {
        const deltaTime = Date.now() - this.lastFrameTime
        const increment = 0.007 * deltaTime / 16

        if (this.contentOpacity > 1) {
          this.contentOpacity = 1
          return
        }

        window.requestAnimFrame(this.fadingLoop)
        this.contentOpacity += increment
        this.lastFrameTime = Date.now()
      },
      countdownLoop () {
        const distance = this.countDownDate - new Date().getTime()

        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        const formatValue = (value, name) => `${value}&nbsp;${name}${value === 1 ? '' : 's'}`

        if (distance < 0) {
          clearInterval(this.countdownLoop)
          this.untilHtml = 'it is finally time!'
        } else {
          this.untilHtml = `${formatValue(days, 'day')} ${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} ${formatValue(seconds, 'second')}`
        }

        return this.countdownLoop
      },
      latestNewsClick () {
        if (this.isTouch) return

        this.initIframe()

        const html = document.createElement('div')
        html.innerHTML = document.getElementById('news-iframe').innerHTML

        const iframe = html.querySelector('iframe')
        iframe.setAttribute('width', this.iframeWidth)
        iframe.setAttribute('height', this.iframeHeight)

        window.Swal.fire({
          html: iframe.outerHTML,
          showConfirmButton: false,
          background: 'rgba(0,0,0,0)'
        }).then(value => { this.iframeVisible = value })

        this.toastVisible = false
        this.bottomHiddenBarVisible = false
        this.iframeVisible = false
      },
      trailerClick () {
        if (this.isTouch) return

        this.initIframe()

        const html = document.createElement('div')
        html.innerHTML = document.getElementById('trailer-iframe').innerHTML

        const iframe = html.querySelector('iframe')
        iframe.setAttribute('width', this.iframeWidth)
        iframe.setAttribute('height', this.iframeHeight)

        window.Swal.fire({
          html: iframe.outerHTML,
          showConfirmButton: false,
          background: 'rgba(0,0,0,0)'
        }).then(value => { this.iframeVisible = value })

        this.toastVisible = false
        this.bottomHiddenBarVisible = false
        this.iframeVisible = false
      },
      initCountDownDate () {
        if (new Date().getTime() > new Date('Oct 31, 2021 04:00:00').getTime()) {
          this.countDownDate = new Date('Jan 21, 2022 00:00:00').getTime()
        } else {
          this.countDownDate = new Date('Jan 20, 2022 23:00:00').getTime()
        }

        this.untilInterval = setInterval(this.countdownLoop(), 1000)
      },
      initToastStyles () {
        if (this.isTouch) {
          this.toastStyle.left = '48%'
        } else {
          this.toastStyle.left = '49%'
          this.toastStyle.fontSize = '20px'
        }
      },
      initIframe () {
        this.iframeWidth = window.innerWidth * 0.75
        this.iframeHeight = window.innerWidth * 0.75 * (9 / 16)

        if (this.iframeHeight > window.innerHeight) {
          this.iframeWidth = window.innerHeight * 0.75 / (9 / 16)
          this.iframeHeight = window.innerHeight * 0.75
        }
      },
      initBackgroundInterval () {
        setInterval(
          () => {
            if (this.today !== new Date().getDay()) {
              this.today = new Date().getDay()
              this.updateBackground()
            }
          }
          , 1000
        )
      },
      initBottomHiddenBar () {
        if (this.isTouch) {
          const mc = new window.Hammer.Manager(document.body, {
            recognizers: [[window.Hammer.Swipe, { direction: window.Hammer.DIRECTION_ALL }]]
          })

          mc.on('swipeup', () => {
            window.open('https://m.youtube.com/playlist?list=PLEvjQXUVNXtLaInE60PML5EF49jI8qw9_')
          })

          mc.on('swipedown', () => {
            document.location.reload()
          })
        } else {
          document.body.onmousemove = e => {
            if (!this.iframeVisible) return

            const pos = { x: e.clientX, y: e.clientY }
            if (pos.y < window.innerHeight - 100) {
              this.bottomHiddenBarVisible = false
              return
            }

            this.toastVisible = false
            this.bottomHiddenBarVisible = true
          }
        }
      }
    }
  })
})()
