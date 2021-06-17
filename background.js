;(() => {
  const isMobile = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const rand = function (a, b) { return ~~((Math.random() * (b - a + 1)) + a) }
  let today

  getBackground()

  setInterval((function loop () {
    if (today !== new Date().getDay()) {
      getBackground()
    }
    return loop
  })(), 1000)

  function getBackground () {
    today = new Date().getDay()
    backgroundExists('resources/backgrounds/' + new Date().getDay() + '-' + rand(0, 1) + '.jpg')
  }

  function backgroundExists (url) {
    window.fetch(url, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          SetBackground(url)
        } else {
          SetBackground('resources/backgrounds/' + (new Date().getDay()) + '-0.jpg')
        }
      })
  }

  function SetBackground (url) {
    document.body.style.background = 'black url(' + url + ')'
    document.body.style.backgroundRepeat = 'no-repeat'
    document.body.style.backgroundAttachment = 'fixed'

    if (isMobile) {
      document.body.style.backgroundSize = 'auto'
      document.body.style.backgroundPosition = '50% 0%'
    } else {
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = '50% 50%'
    }
  }
})()
