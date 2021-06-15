;(() => {
  const isMobile = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  let today

  setBackground()

  setInterval((function loop () {
    if (today !== new Date().getDay()) {
      setBackground()
    }
    return loop
  })(), 1000)

  function setBackground () {
    today = new Date().getDay()
    document.body.style.background = 'black url(resources/backgrounds/' + new Date().getDay() + '.jpg)'
    document.body.style.backgroundRepeat = 'no-repeat'

    if (isMobile) {
      document.body.style.backgroundSize = 'auto'
      document.body.style.backgroundPosition = '50% 0%'
      document.body.style.backgroundAttachment = 'local'
    } else {
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = '50% 50%'
      document.body.style.backgroundAttachment = 'fixed'
    }
  }
})()
