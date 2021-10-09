;(() => {
  const rand = function (a, b) { return ~~((Math.random() * (b - a + 1)) + a) }

  window.requestAnimFrame = (function () { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) { window.setTimeout(a, 1E3 / 60) } }())

  async function setBackground (url, isMobile) {
    const blobUrl = await window.fetch(url)
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob))

    document.body.style.background = 'black url(' + blobUrl + ')'
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

      lastFrameTime: 0,

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
        version: 4,
        sparksPlaying: true,
        bottomBar: true,
        backgroundImage: true,
        music: 'none',
        volume: 50,
        uncompressedImages: false,
        bigTaskbar: false,
        sparksSpeed: 36,
        formattedSparksSpeed: '1x'
      }
    },
    async mounted () {
      const self = this

      const savedSettings = JSON.parse(window.localStorage.getItem('settings'))
      if (savedSettings && savedSettings.version === this.settings.version) {
        this.settings = savedSettings
      } else {
        window.localStorage.setItem('settings', JSON.stringify(this.settings))
      }

      try {
        document.createEvent('TouchEvent')
        this.isTouch = true
      } catch { this.isTouch = false }

      await this.updateBackground()
      setTimeout(function () { self.toastVisible = false }, 5000)

      this.initCountDownDate()
      this.initToastStyles()
      this.initBackgroundInterval()
      this.initBottomHiddenBar()

      this.fadingLoop()
      this.updateMusic()
      this.initListeners()
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
      },
      'settings.uncompressedImages' () {
        this.updateBackground()
      }
    },
    methods: {
      async updateBackground () {
        if (!this.settings.backgroundImage) return

        const uncompressed = this.settings.uncompressedImages ? '-u' : ''
        const url = 'resources/backgrounds/' + this.today + '-' + rand(0, 4) + uncompressed + '.jpg'
        await window.fetch(url, { method: 'HEAD' })
          .then(res => res.ok ? url : 'resources/backgrounds/' + this.today + '-0' + uncompressed + '.jpg')
          .then(url => setBackground(url, this.isMobile))
      },
      updateMusic () {
        try {
          this.musicPlayer.pause()
          this.musicPlayer.currentTime = 0
        } catch {}

        if (!(this.settings.music === 'none')) {
          this.musicPlayer = new window.Audio(this.settings.music)
          this.musicPlayer.loop = true
          this.musicPlayer.volume = (this.settings.volume / 100)
        } else {
          this.musicPlayer = null
        }
      },
      updateVolume (value) {
        this.settings.volume = value
        document.getElementById('volumeValue').innerText = this.settings.volume + '%'
        if (this.musicPlayer != null) {
          this.musicPlayer.volume = (this.settings.volume / 100)
        }
      },
      updateSparksSpeed (value) {
        this.settings.sparksSpeed = value
        this.getFormattedSparksSpeed(value)
      },
      getFormattedSparksSpeed (value) {
        let formattedValue
        if (value === 8) {
          formattedValue = '2x'
          document.getElementById('sparksSpeedValue').innerText = formattedValue
          this.settings.formattedSparksSpeed = formattedValue
        } else if (value === 36) {
          formattedValue = '1x'
          document.getElementById('sparksSpeedValue').innerText = formattedValue
          this.settings.formattedSparksSpeed = formattedValue
        } else if (value === 64) {
          formattedValue = '0.01x'
          document.getElementById('sparksSpeedValue').innerText = formattedValue
          this.settings.formattedSparksSpeed = formattedValue
        } else {
          formattedValue = parseFloat(2.28571 - 0.0357143 * this.settings.sparksSpeed + '').toFixed(2) + 'x'
          document.getElementById('sparksSpeedValue').innerText = formattedValue
          this.settings.formattedSparksSpeed = formattedValue
        }
      },
      fadingLoop () {
        if (!this.lastFrameTime) this.lastFrameTime = Date.now()

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
        if (this.musicPlayer !== null) { this.musicPlayer.pause() }

        if (this.isTouch) {
          window.open(src)
        } else {
          this.initIframe()

          const html = document.createElement('div')
          html.innerHTML = document.getElementById('iframe').innerHTML

          const iframe = html.querySelector('iframe')
          iframe.setAttribute('width', this.iframeWidth)
          iframe.setAttribute('height', this.iframeHeight)
          iframe.setAttribute('src', src)
          iframe.setAttribute('id', 'lastIframe')

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
        }
      },
      settingsClick () {
        window.Swal.fire({
          html: /* html */ `
            <div id="settings">
              <h1 style="text-align: center; font-weight: bold">Settings</h1>
              <hr />
              <h3 style="text-align: center; font-weight: bold">Background</h3>
              <div class="settings-items">
                <input type="checkbox" ${this.settings.backgroundImage ? 'checked' : ''} id="background" onclick="window.app.settings.backgroundImage = !window.app.settings.backgroundImage">
                <label for="background" style="color: white">Enabled</label>
              </div>
              <div class="settings-items">
                <input type="checkbox" ${this.settings.uncompressedImages ? 'checked' : ''} id="uncompressedToggle" onclick="window.app.settings.uncompressedImages = !window.app.settings.uncompressedImages">
                <label for="uncompressedToggle" style="color: white">Uncompressed images</label>
              </div>
              <h3 style="text-align: center; font-weight: bold">Sparks</h3>
              <div class="settings-items">
                <input type="checkbox" ${this.settings.sparksPlaying ? 'checked' : ''} id="sparksToggle" onclick="window.app.settings.sparksPlaying = !window.app.settings.sparksPlaying">
                <label for="sparksToggle" style="color: white">Enabled</label>
              </div>
              <div class="settings-items">
                <label for="sparksSpeed">Speed:</label>
                <input type="range" min="-64" max="-8" value="${-window.app.settings.sparksSpeed}" id="sparksSpeed" oninput="window.app.updateSparksSpeed(-value)">
                <label id="sparksSpeedValue">${window.app.settings.formattedSparksSpeed}</label>
              </div>
              <h3 style="text-align: center; font-weight: bold">Music</h3>
              <div class="settings-items">
                <label for="music">Track:</label>
                <select name="music" id="music" onchange="window.app.settings.music = value">
                  <option ${this.settings.music === 'none' ? 'selected' : ''} value="none">None</option>
                  <option ${this.settings.music === 'resources/music/alex-roe.mp3' ? 'selected' : ''} value="resources/music/alex-roe.mp3">The Flame of Ambition by Alex Roe</option>
                  <option ${this.settings.music === 'resources/music/timothy-richards.mp3' ? 'selected' : ''} value="resources/music/timothy-richards.mp3">Debut Trailer by Timothy Richards</option>
                  <option ${this.settings.music === 'resources/music/timothy-richards-2.mp3' ? 'selected' : ''} value="resources/music/timothy-richards-2.mp3">Trailer Soundtrack Medley by Timothy Richards</option>
                </select>
              </div>
              <div class="settings-items">
                <label for="volume">Volume:</label>
                <input type="range" min="0" max="100" value="${window.app.settings.volume}" id="volume" oninput="window.app.updateVolume(value)">
                <label id="volumeValue">${window.app.settings.volume + '%'}</label>
              </div>
              <h3 style="text-align: center; font-weight: bold">Misc</h3>
              <div class="settings-items" id="bottomBarDiv">
                <input type="checkbox" ${this.settings.bottomBar ? 'checked' : ''} id="bottomBar" onclick="window.app.settings.bottomBar = !window.app.settings.bottomBar">
                <label for="bottomBar" style="color: white">Bottom bar (Toggle by pressing ESC)</label>
              </div>
              <div class="settings-items" id="taskbarToggleDiv">
                <input type="checkbox" ${this.settings.bigTaskbar ? 'checked' : ''} id="taskbarToggle" onclick="window.app.settings.bigTaskbar = !window.app.settings.bigTaskbar">
                <label for="taskbarToggle" style="color: white">Big taskbar (Raises bottom bar height)</label>
              </div>
              <hr class="settings-items"/>
              <a id="github" href="https://github.com/IceDBorn/days-until-elden-ring" target="_blank">
                <h2 id="github">
                  <img src="resources/github.png" alt="github logo" width="20px" height="20px">
                  Github
                </h2>
              </a>
            </div>
        `,
          showConfirmButton: false,
          background: 'rgba(50,50,50,1)'
        }).then(value => { this.menuVisible = value })

        this.toastVisible = false
        if (!this.isTouch) { this.bottomHiddenBarVisible = false }
        this.menuVisible = false

        if (this.isTouch) { document.getElementById('bottomBarDiv').hidden = true }
        if (this.isTouch) { document.getElementById('taskbarToggleDiv').hidden = true }
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
          this.toastMessage = 'swipe up for info and settings'
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
            this.bottomHiddenBarVisible = true
            this.toastVisible = false
          })

          mc.on('swipedown', () => {
            if (!this.bottomHiddenBarVisible) {
              window.location.reload()
            } else { this.bottomHiddenBarVisible = false }
          })
        } else {
          document.body.onmousemove = e => {
            if (!(this.menuVisible && window.app.settings.bottomBar)) {
              this.bottomHiddenBarVisible = false
              return
            }

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
      initListeners () {
        if (!(this.settings.bottomBar || this.isTouch)) {
          this.toastMessage = 'press esc to re-enable the bottom bar'
        }
        document.addEventListener('keydown', e => {
          if (e.code === 'Escape') {
            this.settings.bottomBar = !this.settings.bottomBar
          }
        })

        document.body.addEventListener('mousemove', () => this.musicPlayer?.currentTime === 0 && this.musicPlayer?.play())
        document.body.addEventListener('click', () => this.musicPlayer?.currentTime === 0 && this.musicPlayer?.play())
        document.body.addEventListener('keydown', () => this.musicPlayer?.currentTime === 0 && this.musicPlayer?.play())

        window.addEventListener('resize', () => {
          this.initIframe()
          const iframe = document.getElementById('lastIframe')
          iframe?.setAttribute('width', this.iframeWidth)
          iframe?.setAttribute('height', this.iframeHeight)
        })
      }
    }
  })
  window.app = app
})()
