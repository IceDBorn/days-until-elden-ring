;(() => {
  const toast = document.getElementById('toast')

  let today = new Date().getDay()

  document.body.style.background = 'black url(resources/backgrounds/' + new Date().getDay() + '.jpg)'
  document.body.style.backgroundRepeat = 'no-repeat'
  document.body.style.backgroundAttachment = 'fixed'
  toast.style.fontFamily = 'Mantinia'
  toast.className = 'show'

  if (isTouch()) {
    document.body.style.backgroundSize = 'auto'
    document.body.style.backgroundPosition = '50% 0%'
    toast.style.left = '48%'
    toast.innerText = 'swipe  up for the latest news'
    setTimeout(function () {
      toast.className = toast.className.replace('show', '')
    }, 5000)
  } else {
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = '50% 50%'
    toast.style.left = '49%'
    toast.style.fontSize = '20px'
    toast.innerText = 'move the mouse cursor here for the latest news'
    setTimeout(function () {
      toast.className = toast.className.replace('show', '')
    }, 5000)
  }

  setInterval((function loop () {
    if (today !== new Date().getDay()) {
      today = new Date().getDay()
      document.body.style.background = 'black url(resources/backgrounds/' + new Date().getDay() + '.jpg)'
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundAttachment = 'fixed'

      if (isTouch()) {
        document.body.style.backgroundSize = 'auto'
        document.body.style.backgroundPosition = '50% 0%'
      } else {
        document.body.style.backgroundSize = 'cover'
        document.body.style.backgroundPosition = '50% 50%'
      }
    }
    return loop
  })(), 1000)

  function isTouch () {
    try {
      document.createEvent('TouchEvent')
      return true
    } catch (e) { return false }
  }
})()
