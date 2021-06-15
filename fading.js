;(() => {
  const content = document.getElementById('content')

  setTimeout(fading, 100)

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
})()
