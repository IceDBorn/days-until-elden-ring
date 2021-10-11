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

  function calcFPS (opts) {
    const count = opts.count || 60
    let index
    // eslint-disable-next-line no-undef
    const start = performance.now()
    const requestFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame
    if (!requestFrame) return true
    function checker () {
      if (index--) requestFrame(checker)
      else {
        // eslint-disable-next-line no-undef
        const result = count * 1000 / (performance.now() - start)
        if (typeof opts.callback === 'function') opts.callback(result)
        window.app.fps = Math.round(result)
      }
    }
    if (!opts) opts = {}
    index = count
    checker()
  }

  calcFPS({ count: 144 })

  window.app = new window.Vue({
    el: '#app',
    data: {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      countDownDate: 0,
      today: new Date().getDay(),
      isTouch: false,
      fps: 60,

      lastFrameTime: 0,

      musicPlayer: null,

      contentOpacity: 0,

      untilInterval: null,
      untilHtml: '',

      iframeWidth: 0,
      iframeHeight: 0,

      menuVisible: true,

      hiddenBarVisible: false,

      toastVisible: true,
      toastStyle: {},
      toastMessage: null,

      letterStyle: {},

      settings: {
        version: 0.4,
        backgroundImage: true,
        bigTaskbar: false,
        bottomBar: true,
        dropShadow: false,
        dropShadowBlur: '0',
        dropShadowBrightness: '1.25',
        dropShadowColor: '',
        dropShadowX: '0',
        dropShadowY: '0',
        formattedSparksSpeed: '1.00x',
        formattedSparksTick: '1.00x',
        letterOpacity: 1,
        music: 'none',
        sparksPlaying: true,
        sparksSpeed: 36,
        sparksTick: 20,
        uncompressedImages: false,
        volume: 50
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

      this.initBackgroundInterval()
      this.initHiddenBar()
      this.initCountDownDate()
      this.initLettersStyle()
      this.initListeners()
      this.initToastStyles()
      this.updateMusic()
      this.fadingLoop()
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
      'settings.dropShadowBlur' () {
        this.updateLettersStyle()
      },
      'settings.dropShadowBrightness' () {
        this.updateLettersStyle()
      },
      'settings.dropShadowColor' () {
        this.updateLettersStyle()
      },
      'settings.dropShadowX' () {
        this.updateLettersStyle()
      },
      'settings.dropShadowY' () {
        this.updateLettersStyle()
      },
      'settings.letterOpacity' () {
        this.updateLettersStyle()
      },
      'settings.music' () {
        this.updateMusic()
      },
      'settings.uncompressedImages' () {
        this.updateBackground()
      }
    },
    methods: {
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
          this.hiddenBarVisible = false
          this.menuVisible = false
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
      initHiddenBar () {
        if (this.isTouch) {
          const mc = new window.Hammer.Manager(document.body, {
            recognizers: [[window.Hammer.Swipe, { direction: window.Hammer.DIRECTION_ALL }]]
          })

          mc.on('swipeup', () => {
            this.hiddenBarVisible = true
            this.toastVisible = false
          })

          mc.on('swipedown', () => {
            if (!this.hiddenBarVisible) {
              window.location.reload()
            } else { this.hiddenBarVisible = false }
          })
        } else {
          document.body.onmousemove = e => {
            if (!(this.menuVisible && window.app.settings.bottomBar)) {
              this.hiddenBarVisible = false
              return
            }

            const pos = { x: e.clientX, y: e.clientY }
            if (pos.y < window.innerHeight - 100) {
              this.hiddenBarVisible = false
              return
            }

            this.toastVisible = false
            this.hiddenBarVisible = true
          }
        }
      },
      initCountDownDate () {
        if (new Date().getTime() > new Date('Oct 31, 2021 04:00:00').getTime()) {
          this.countDownDate = new Date('Jan 21, 2022 00:00:00').getTime()
        } else {
          this.countDownDate = new Date('Jan 20, 2022 23:00:00').getTime()
        }

        this.untilInterval = setInterval(this.countdownLoop(), 1000)
      },
      initIframe () {
        this.iframeWidth = window.innerWidth * 0.75
        this.iframeHeight = window.innerWidth * 0.75 * (9 / 16)

        if (this.iframeHeight > window.innerHeight) {
          this.iframeWidth = window.innerHeight * 0.75 / (9 / 16)
          this.iframeHeight = window.innerHeight * 0.75
        }
      },
      initLettersStyle () {
        this.letterStyle.opacity = this.settings.letterOpacity
        this.toastStyle.opacity = this.settings.letterOpacity
        this.letterStyle.filter = 'brightness(' + this.settings.dropShadowBrightness + ') drop-shadow(' + this.settings.dropShadowColor + ' ' + this.settings.dropShadowX + 'px ' + this.settings.dropShadowY + 'px ' + this.settings.dropShadowBlur + 'px'
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
      },
      initToastStyles () {
        this.toastStyle.filter = 'brightness(' + this.settings.dropShadowBrightness + ') drop-shadow(' + this.settings.dropShadowColor + ' ' + this.settings.dropShadowX + 'px ' + this.settings.dropShadowY + 'px ' + this.settings.dropShadowBlur + 'px'
        if (this.isTouch) {
          this.toastStyle.left = '48%'
          this.toastMessage = 'swipe up for info and settings'
        } else {
          this.toastStyle.left = '49%'
          this.toastStyle.fontSize = '20px'
          this.toastMessage = 'move the mouse cursor here for info and settings'
        }
      },
      letterEditorClick () {
        console.log('gay')
        window.Swal.fire({
          html: /* html */ `
            <div id="lettersEditor">
                <h1 style="text-align: center; font-weight: bold; color: white;">Editor</h1>
                <hr />
                <h3 style="text-align: center; font-weight: bold; color: white;">Letters</h3>
                    <div class="letter-editor-items">
                      <label for="dropShadowBrightness" style="color: white">Brightness:</label>
                      <input type="number" id="dropShadowBrightness" step="0.25" oninput="window.app.settings.dropShadowBrightness = value" value="${window.app.settings.dropShadowBrightness}">
                    </div>
                    <div class="letter-editor-items">
                      <label for="letterOpacity" style="color: white">Opacity:</label>
                      <input type="number" id="letterOpacity" min="0.1" max="1" step="0.1" oninput="window.app.settings.letterOpacity = value" value="${window.app.settings.letterOpacity}">
                    </div>
                    <h3 style="text-align: center; font-weight: bold; color: white;">Drop shadow</h3>
                    <div class="letter-editor-items">
                      <label for="dropShadowBlur" style="color: white">Blur:</label>
                      <input type="number" id="dropShadowBlur" min="0" max="50" oninput="window.app.settings.dropShadowBlur = value" value="${window.app.settings.dropShadowBlur}">
                    </div>
                    <div class="letter-editor-items">
                      <label for="color" style="color: white">Color:</label>
                      <input type="text" id="color" placeholder="Plain english or HEX" oninput="window.app.settings.dropShadowColor = value" value="${window.app.settings.dropShadowColor}">
                    </div>
                    <div class="letter-editor-items">
                      <label for="dropShadowX" style="color: white">Position X:</label>
                      <input type="number" id="dropShadowX" oninput="window.app.settings.dropShadowX = value" value="${window.app.settings.dropShadowX}">
                    </div>
                    <div class="letter-editor-items">
                      <label for="dropShadowY" style="color: white">Position Y:</label>
                      <input type="number" id="dropShadowY" oninput="window.app.settings.dropShadowY = value" value="${window.app.settings.dropShadowY}">
                    </div>
            </div>
        `,
          showConfirmButton: false,
          background: 'rgba(50,50,50,1)',
          position: 'top-end'
        }).then(value => { this.menuVisible = value })
        // Remove swal2 backdrop with jQuery
        // eslint-disable-next-line no-undef
        $('.swal2-container.swal2-backdrop-show, .swal2-container.swal2-noanimation').css('background', 'rgba(0, 0, 0, 0)')
      },
      setFormattedSparksSpeed () {
        const formattedValue = parseFloat(2.28262 - 0.0355357 * this.settings.sparksSpeed + '').toFixed(2) + 'x'
        document.getElementById('sparksSpeedValue').innerText = formattedValue
        this.settings.formattedSparksSpeed = formattedValue
      },
      setFormattedSparksTick () {
        const formattedValue = parseFloat(2.33 - 0.0663333 * this.settings.sparksTick + '').toFixed(2) + 'x'
        document.getElementById('sparksTickValue').innerText = formattedValue
        this.settings.formattedSparksTick = formattedValue
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
                <label for="sparksTick">Amount:</label>
                <input type="range" min="-35" max="-5" value="${-window.app.settings.sparksTick}" id="sparksTick" oninput="window.app.updateSparksTick(-value)">
                <label id="sparksTickValue">${window.app.settings.formattedSparksTick}</label>
              </div>
              <div class="settings-items">
                <label for="sparksSpeed">Speed:</label>
                <input type="range" min="-64" max="-8" value="${-window.app.settings.sparksSpeed}" id="sparksSpeed" oninput="window.app.updateSparksSpeed(-value)">
                <label id="sparksSpeedValue">${window.app.settings.formattedSparksSpeed}</label>
              </div>
              <h3 style="text-align: center; font-weight: bold">Music</h3>
              <div class="settings-items">
                <label for="music">Track:</label>
                <select id="music" onchange="window.app.settings.music = value">
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
              <button id="editor-button" onclick="window.app.letterEditorClick()"><span>Letters editor</span></button>
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
        if (!this.isTouch) { this.hiddenBarVisible = false }
        this.menuVisible = false

        if (this.isTouch) { document.getElementById('bottomBarDiv').hidden = true }
        if (this.isTouch) { document.getElementById('taskbarToggleDiv').hidden = true }
      },
      async updateBackground () {
        if (!this.settings.backgroundImage) return

        const uncompressed = this.settings.uncompressedImages ? '-u' : ''
        const url = 'resources/backgrounds/' + this.today + '-' + rand(0, 4) + uncompressed + '.jpg'
        await window.fetch(url, { method: 'HEAD' })
          .then(res => res.ok ? url : 'resources/backgrounds/' + this.today + '-0' + uncompressed + '.jpg')
          .then(url => setBackground(url, this.isMobile))
      },
      updateLettersStyle () {
        if (this.settings.dropShadowBlur < 0) {
          this.settings.dropShadowBlur = 0
        } else if (this.settings.dropShadowBlur > 50) {
          this.settings.dropShadowBlur = 50
        }
        if (this.settings.letterOpacity > 1) {
          this.settings.letterOpacity = 1
        } else if (this.settings.letterOpacity < 0.1) {
          this.settings.letterOpacity = 0.1
        }
        this.letterStyle.opacity = this.settings.letterOpacity
        this.letterStyle.filter = 'brightness(' + this.settings.dropShadowBrightness + ') drop-shadow(' + this.settings.dropShadowColor + ' ' + this.settings.dropShadowX + 'px ' + this.settings.dropShadowY + 'px ' + this.settings.dropShadowBlur + 'px'
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
      updateSparksSpeed (value) {
        this.settings.sparksSpeed = value
        this.setFormattedSparksSpeed(value)
      },
      updateSparksTick (value) {
        this.settings.sparksTick = value
        this.setFormattedSparksTick(value)
      },
      updateVolume (value) {
        this.settings.volume = value
        document.getElementById('volumeValue').innerText = this.settings.volume + '%'
        if (this.musicPlayer != null) {
          this.musicPlayer.volume = (this.settings.volume / 100)
        }
      }
    }
  })
})()
