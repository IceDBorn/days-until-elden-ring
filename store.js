export default {
  contentOpacity: 0,
  countDownDate: 0,
  fading: true,
  fps: 60,
  hiddenBarVisible: false,
  iframeHeight: 0,
  iframeWidth: 0,
  isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTouch: false,
  lastFrameTime: 0,
  textStyle: {},
  textOpacity: 0,
  menuVisible: true,
  musicPlayer: null,
  settings: {
    version: 1.1,
    backgroundImage: true,
    bigTaskbar: false,
    hiddenBar: true,
    dropShadow: false,
    dropShadowBlur: '3',
    textBrightness: '1.25',
    topBar: 'false',
    dropShadowColor: 'black',
    dropShadowX: '2',
    dropShadowY: '2',
    maxTextOpacity: 1,
    music: 'none',
    sparksPlaying: true,
    sparksSpeed: -36,
    sparksTick: -20,
    uncompressedImages: false,
    volume: 50
  },
  toastMessage: null,
  toastStyle: {},
  today: new Date().getDay(),
  untilHtml: '',
  untilInterval: null,
  countdownUpdate: 0,
  countdown: {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  }
}
