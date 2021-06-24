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

      musicPlayer: null,

      contentOpacity: 0,

      untilInterval: null,
      untilHtml: '',

      iframeWidth: 0,
      iframeHeight: 0,

      menuVisible: true,

      bottomHiddenBarVisible: false,

      toastVisible: true,
      toastStyle: {},
      toastMessage: null,

      settings: {
        version: 0,
        sparksPlaying: true,
        bottomBar: true,
        backgroundImage: true,
        music: 'none'
      }
    },
    mounted () {
      const self = this

      const savedSettings = JSON.parse(window.localStorage.getItem('settings'))
      if (savedSettings && savedSettings.version === this.settings.version) this.settings = savedSettings

      try {
        document.createEvent('TouchEvent')
        this.isTouch = true
      } catch { this.isTouch = false }
      setTimeout(function () { self.toastVisible = false }, 5000)

      this.initCountDownDate()
      this.initToastStyles()
      this.initBackgroundInterval()
      this.initBottomHiddenBar()

      this.updateBackground()
      this.fadingLoop()
      this.updateMusic()
      this.initEscapeListener()
    },
    watch: {
      settings: {
        handler () {
          window.localStorage.setItem('settings', JSON.stringify(this.settings))
        },
        deep: true
      },
      'settings.backgroundImage' () {
        if (this.settings.backgroundImage) {
          this.updateBackground()
        } else {
          document.body.style.background = 'black'
        }
      },
      'settings.music' () {
        this.updateMusic()
      }
    },
    methods: {
      updateBackground () {
        if (!this.settings.backgroundImage) return

        let url = 'resources/backgrounds/' + this.today + '-' + rand(0, 2) + '.jpg'
        window.fetch(url, { method: 'HEAD' })
          .then(res => {
            if (!res.ok) {
              url = 'resources/backgrounds/' + this.today + '-0.jpg'
            }

            setBackground(url, this.isMobile)
          })
      },
      updateMusic () {
        try {
          this.musicPlayer.pause()
          this.musicPlayer.currentTime = 0
        } catch {}

        if (!(this.settings.music === 'none')) {
          this.musicPlayer = new window.Audio(this.settings.music)
          this.musicPlayer.loop = true

          document.body.addEventListener('mousemove', function () {
            if (window.app.musicPlayer !== null && window.app.musicPlayer.currentTime === 0) {
              window.app.musicPlayer.play()
            }
          })
        } else {
          this.musicPlayer = null
        }
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
      iframeClick (src) {
        if (this.isTouch) return
        if (this.musicPlayer !== null) {
          this.musicPlayer.pause()
        }

        this.initIframe()

        const html = document.createElement('div')
        html.innerHTML = document.getElementById('iframe').innerHTML

        const iframe = html.querySelector('iframe')
        iframe.setAttribute('width', this.iframeWidth)
        iframe.setAttribute('height', this.iframeHeight)
        iframe.setAttribute('src', src)

        window.Swal.fire({
          html: iframe.outerHTML,
          showConfirmButton: false,
          background: 'rgba(0,0,0,0)'
        }).then(value => {
          this.menuVisible = value
          if (this.musicPlayer !== null) {
            this.musicPlayer.play()
          }
        })

        this.toastVisible = false
        this.bottomHiddenBarVisible = false
        this.menuVisible = false
      },
      settingsClick () {
        if (this.isTouch) return

        window.Swal.fire({
          html: /* html */ `
            <div style="text-align: left; color: white">
              <input type="checkbox" ${this.settings.backgroundImage ? 'checked' : ''} id="background" onclick="window.app.settings.backgroundImage = !window.app.settings.backgroundImage">
              <label for="background" style="color: white">Background</label><br>
              <input type="checkbox" ${this.settings.bottomBar ? 'checked' : ''} id="bottomBar" onclick="window.app.settings.bottomBar = !window.app.settings.bottomBar">
              <label for="bottomBar" style="color: white">Bottom bar (Toggle by pressing ESC)</label><br>
              <input type="checkbox" ${this.settings.sparksPlaying ? 'checked' : ''} id="sparksToggle" onclick="window.app.settings.sparksPlaying = !window.app.settings.sparksPlaying">
              <label for="sparksToggle" style="color: white">Sparks</label><br>
              <label for="music">Music:</label>
              <select name="music" id="music" onchange="window.app.settings.music = value" style="background-color: gray; color: white">
                <option ${this.settings.music === 'none' ? 'selected' : ''} value="none">None</option>
                <option ${this.settings.music === 'resources/music/alex-roe.mp3' ? 'selected' : ''} value="resources/music/alex-roe.mp3">The Flame of Ambition by Alex Roe</option>
                <option ${this.settings.music === 'resources/music/timothy-richards.mp3' ? 'selected' : ''} value="resources/music/timothy-richards.mp3">Debut Trailer by Timothy Richards</option>
              </select>
            </div>
        `,
          showConfirmButton: false,
          background: 'rgba(50,50,50,1)'
        }).then(value => { this.menuVisible = value })

        this.toastVisible = false
        this.bottomHiddenBarVisible = false
        this.menuVisible = false
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
          this.toastMessage = 'swipe up for the latest news'
        } else {
          this.toastStyle.left = '49%'
          this.toastStyle.fontSize = '20px'
          this.toastMessage = 'move the mouse cursor here for info and settings'
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
            if (!(this.menuVisible && window.app.settings.bottomBar)) return

            const pos = { x: e.clientX, y: e.clientY }
            if (pos.y < window.innerHeight - 100) {
              this.bottomHiddenBarVisible = false
              return
            }

            this.toastVisible = false
            this.bottomHiddenBarVisible = true
          }
        }
      },
      initEscapeListener () {
        if (!(this.settings.bottomBar || this.isTouch)) {
          this.toastMessage = 'press esc to re-enable bottom bar'
        }
        document.addEventListener('keydown', e => {
          if (e.code === 'Escape') {
            this.settings.bottomBar = !this.settings.bottomBar
          }
        })
      }
    }
  })
  window.app = app
})()
