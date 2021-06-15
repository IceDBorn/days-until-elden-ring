;(() => {
  const until = document.getElementById('until')

  let countDownDate

  if (new Date().getTime() > new Date('Oct 31, 2021 04:00:00').getTime()) {
    countDownDate = new Date('Jan 21, 2022 00:00:00').getTime()
  } else {
    countDownDate = new Date('Jan 20, 2022 23:00:00').getTime()
  }

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
})()
