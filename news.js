;(() => {
  const toast = document.getElementById('toast')
  let flag = true
  let iframeWidth = window.innerWidth * 0.75
  let iframeHeight = window.innerWidth * 0.75 * (9 / 16)

  if (iframeHeight > window.innerHeight) {
    iframeWidth = window.innerHeight * 0.75 / (9 / 16)
    iframeHeight = window.innerHeight * 0.75
  }

  if (isTouch()) {
    const mc = new window.Hammer.Manager(document.body, {
      recognizers: [[window.Hammer.Swipe, { direction: window.Hammer.DIRECTION_ALL }]]
    })

    mc.on('swipeup', () => {
      window.open('https://m.youtube.com/playlist?list=PLEvjQXUVNXtLaInE60PML5EF49jI8qw9_')
    })

    mc.on('swipedown', () => {
      document.location.reload()
    })
  } else {
    const bottomHiddenBar = document.getElementById('bottom-hidden-bar')
    const latestNewsButton = document.getElementById('latest-news-button')

    document.body.onmousemove = e => {
      if (flag) {
        const pos = { x: e.clientX, y: e.clientY }
        if (pos.y < window.innerHeight - 100) {
          bottomHiddenBar.style.display = 'none'
          return
        }

        toast.style.display = 'none'
        bottomHiddenBar.style.display = 'block'
      }
    }

    latestNewsButton.onclick = function swal () {
      window.Swal.fire({
        html: /* html */ `
          <iframe class="center" width="${iframeWidth}" height="${iframeHeight}"
            src="https://www.youtube.com/embed/+lastest?list=PLEvjQXUVNXtLaInE60PML5EF49jI8qw9_"
            title="latest news"
            style="border:0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        `,
        showConfirmButton: false,
        background: 'rgba(0,0,0,0)'
      }).then(value => { flag = value })
      bottomHiddenBar.style.display = 'none'
      flag = false
    }
  }

  function isTouch () {
    try { document.createEvent('TouchEvent'); return true } catch (e) { return false }
  }
})()
