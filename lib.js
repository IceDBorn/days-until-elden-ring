export const requestAnimFrame = (function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (a) { window.setTimeout(a, 1E3 / 60) }
}())
