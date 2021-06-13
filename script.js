;(() => {
  const content = document.getElementById('content')
  const until = document.getElementById('until')

  document.body.style.background = 'black url(resources/backgrounds/' + new Date().getDay() + '.jpg)'
  document.body.style.backgroundRepeat = 'no-repeat'
  document.body.style.backgroundAttachment = 'fixed'

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    document.body.style.backgroundSize = 'auto'
    document.body.style.backgroundPosition = '50% 0%'
    until.style.maxWidth = '600px'
  } else {
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = '50% 50%'
  }

  const countDownDate = new Date('Jan 21, 2022 00:00:00').getTime()

  const x = setInterval((function loop () {
    const now = new Date().getTime()

    const distance = countDownDate - now

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    if (distance < 0) {
      clearInterval(x)
      until.innerText = 'it is finally time!'
    } else {
      until.innerHTML = `${days}&nbsp;days ${hours}&nbsp;hours ${minutes}&nbsp;minutes ${seconds}&nbsp;seconds`
    }

    return loop
  })(), 1000)

  function fading () {
    const increment = 0.007
    let opacity = 0

    function fadingLoop () {
      if (opacity > 1) {
        opacity = 1
      } else {
        window.requestAnimFrame(fadingLoop)
      }

      document.getElementById('text').style.opacity = opacity
      content.style.backgroundColor = `rgba(0,0,0,${1 - opacity})`
      opacity += increment
    }

    window.requestAnimFrame(fadingLoop)
  }

  setTimeout(fading, 100)
})()
