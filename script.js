;(() => {
  const until = document.getElementById('until')

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

  // Set the date we're counting down to
  const countDownDate = new Date('Jan 21, 2022 00:00:00').getTime()

  // Update the count down every 1 second
  const x = setInterval((function loop () {
    // Get today's date and time
    const now = new Date().getTime()

    // Find the distance between now and the count down date
    const distance = countDownDate - now

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    if (distance < 0) {
      clearInterval(x)
      until.innerText = 'it is finally time!'
    } else {
      // Display the result in the element with id="until"
      until.innerHTML = `${days}&nbsp;days ${hours}&nbsp;hours ${minutes}&nbsp;minutes ${seconds}&nbsp;seconds`
    }

    return loop
  })(), 1000)
})()
