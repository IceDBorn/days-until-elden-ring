;(() => {
  const toast = document.getElementById('toast')

  toast.style.fontFamily = 'Mantinia'
  toast.className = 'show'

  if (isTouch()) {
    toast.style.left = '48%'
    toast.innerText = 'swipe up for the latest news'
  } else {
    toast.style.left = '49%'
    toast.style.fontSize = '20px'
    toast.innerText = 'move the mouse cursor here for the latest news'
  }

  setTimeout(function () {
    toast.className = toast.className.replace('show', '')
  }, 5000)

  function isTouch () {
    try { document.createEvent('TouchEvent'); return true } catch (e) { return false }
  }
})()
