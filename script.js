;(() => {
  const content = document.getElementById('content')
  const until = document.getElementById('until')
  const toast = document.getElementById('toast')
  const isMobile = /Mobi|Tablet|iPad|iPhone/i.test(navigator.userAgent) || window.matchMedia('only screen and (max-width: 760px)').matches
  document.body.style.background = 'black url(resources/backgrounds/' + new Date().getDay() + '.jpg)'
  document.body.style.backgroundRepeat = 'no-repeat'
  document.body.style.backgroundAttachment = 'fixed'
  toast.className = 'show'

  if (isMobile) {
    document.body.style.backgroundSize = 'auto'
    document.body.style.backgroundPosition = '50% 0%'
    until.style.maxWidth = '600px'
    toast.style.left = '48%'
    toast.innerText = 'Swipe  up for the latest news!'
    setTimeout(function () {
      toast.className = toast.className.replace('show', '')
      fadeCompleted()
    }, 2000)
  } else {
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = '50% 50%'
    toast.style.left = '50%'
    toast.style.fontSize = '20px'
    toast.innerText = 'Move the mouse cursor here for the latest news!'
    setTimeout(function () {
      toast.className = toast.className.replace('show', '')
      fadeCompleted()
    }, 2000)
  }

  const countDownDate = new Date('Jan 21, 2022 00:00:00').getTime()

  const x = setInterval((function loop () {
    const now = new Date().getTime()

    const distance = countDownDate - now

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    const formatValue = (value, name) => `${value}&nbsp;${name}${value === 1 ? '' : 's'}`

    if (distance < 0) {
      clearInterval(x)
      until.innerText = 'it is finally time!'
    } else {
      until.innerHTML = `${formatValue(days, 'day')} ${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} ${formatValue(seconds, 'second')}`
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

  function fadeCompleted () {
    if (isMobile) {
      const mc = new window.Hammer.Manager(document.body, {
        recognizers: [[window.Hammer.Swipe, { direction: window.Hammer.DIRECTION_VERTICAL }]]
      })

      mc.on('swipeup', () => {
        window.open('https://m.youtube.com/playlist?list=PLEvjQXUVNXtLaInE60PML5EF49jI8qw9_', '_blank')
      })
    } else {
      const bottomHiddenBar = document.getElementById('bottom-hidden-bar')
      const latestNewsButton = document.getElementById('latest-news-button')

      document.body.onmousemove = e => {
        const pos = { x: e.clientX, y: e.clientY }
        if (pos.y < window.innerHeight - 100) {
          bottomHiddenBar.style.display = 'none'
          return
        }

        bottomHiddenBar.style.display = 'block'
      }

      latestNewsButton.onclick = () => window.Swal.fire({
        html: /* html */ `
          <iframe class="center" width="1280" height="720" src="https://www.youtube.com/embed/+lastest?list=PLEvjQXUVNXtLaInE60PML5EF49jI8qw9_" title="latest news" frameborder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        `,
        showConfirmButton: false,
        background: 'rgba(0,0,0,0)'
      })
    }
  }
})()
