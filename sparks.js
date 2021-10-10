;(() => {
  const c = document.getElementById('sparks')
  const ctx = c.getContext('2d')

  let cw = c.width = window.innerWidth
  let ch = c.height = window.innerHeight

  const rand = function (a, b) { return ~~((Math.random() * (b - a + 1)) + a) }
  const pluses = []
  const count = 300
  let tick = 10
  const tickMax = 10

  let plusesToCreate = 20

  let lastFrameTime = Date.now()

  const Plus = function () {
    this.init()
  }

  Plus.prototype.init = function () {
    this.x = cw * Math.random()
    this.y = ch
    this.vx = (rand(0, 100) - 50) / 12
    this.vy = -(rand(50, 100)) / 90
    this.lightness = Math.random() < 0.7 ? rand(45, 50) : rand(65, 70)
    this.alpha = 1
    this.fade = 1
    this.scale = 1
    this.growth = 0.01
    this.rotation = 8
    this.spin = (rand(0, 100) - 50) / 3000
  }

  Plus.prototype.update = function () {
    let deltaTime = (Date.now() - lastFrameTime) / window.app.settings.sparksSpeed
    if (window.app.fps) {
      if (window.app.fps > 240) {
        deltaTime = deltaTime / 6
      } else if (window.app.fps > 160) {
        deltaTime = deltaTime / 4
      } else if (window.app.fps > 75) {
        deltaTime = deltaTime / 2.4
      } else if (window.app.fps <= 30) {
        deltaTime = deltaTime * 2
      }
    }

    this.x += this.vx * deltaTime
    this.y -= this.vy * deltaTime
    this.vy += 0.15 * this.scale
    if (this.alpha < 1) {
      this.alpha += this.fade
    }

    this.scale += this.growth
    this.rotation += this.spin

    if (this.y - 30 >= ch) {
      this.init()
    }

    return this.y >= 0
  }

  Plus.prototype.render = function () {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.scale, this.scale)
    ctx.rotate('80')

    ctx.fillStyle = 'hsla(20, 200%, ' + this.lightness + '%, 1)'
    ctx.beginPath()
    ctx.rect(-3, -1, 6, 2)
    ctx.fill()
    ctx.restore()
  }

  const createPluses = function () {
    if (plusesToCreate > 1 || pluses.length < count) {
      if (tick >= tickMax) {
        pluses.push(...[...Array(plusesToCreate)].map(_ => new Plus()))
        tick = 0
      } else {
        tick++
      }
    }
  }

  const updatePluses = function () {
    let i = pluses.length
    while (i--) {
      pluses[i].update() || pluses.splice(i, 1)
    }
  }

  const renderPluses = function () {
    let i = pluses.length
    while (i--) {
      pluses[i].render()
    }
  }

  const loop = function () {
    window.requestAnimFrame(loop)
    if (!c.getAttribute('data-sparks-playing')) return

    ctx.clearRect(0, 0, cw, ch)

    cw = c.width = window.innerWidth
    ch = c.height = window.innerHeight

    createPluses()
    updatePluses()
    renderPluses()

    lastFrameTime = Date.now()

    if (plusesToCreate > 1) {
      plusesToCreate -= 1
      if (plusesToCreate < 1) {
        plusesToCreate = 1
      }
    }
  }

  loop()
})()
