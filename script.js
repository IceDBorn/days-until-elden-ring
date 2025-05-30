import store from "./store.js";
import { requestAnimFrame } from "./lib.js";
import sparks from "./sparks.js";
import {
  html as swalSettingsHtml,
  mountSwal as swalSettingsMount,
} from "./components/settings.js";
import {
  html as swalEditorHtml,
  mountSwal as swalEditorMount,
} from "./components/text-editor.js";
import {
  html as iframeHtml,
  mountSwal as swalIframeMount,
} from "./components/iframe.js";
import {
  html as swalPlatformHtml,
  mountSwal as swalPlatformMount,
} from "./components/platform.js";
(() => {
  const rand = function (a, b) {
    return ~~(Math.random() * (b - a + 1) + a);
  };
  let released = false;

  //Use this function to get UTC time
  Date.prototype.getUTCTime = function () {
    return new Date(
      this.getUTCFullYear(),
      this.getUTCMonth(),
      this.getUTCDate(),
      this.getUTCHours(),
      this.getUTCMinutes(),
      this.getUTCSeconds()
    ).getTime();
  };

  function calcFPS(opts) {
    const count = opts.count || 60;
    let index;
    // eslint-disable-next-line no-undef
    const start = performance.now();
    if (!requestAnimFrame) return true;

    function checker() {
      if (index--) requestAnimFrame(checker);
      else {
        // eslint-disable-next-line no-undef
        const result = (count * 1000) / (performance.now() - start);
        if (typeof opts.callback === "function") opts.callback(result);
        window.app.fps = Math.round(result);
      }
    }

    if (!opts) opts = {};
    index = count;
    checker();
  }

  async function setBackground(url, isMobile) {
    const blobUrl = await window
      .fetch(url)
      .then((res) => res.blob())
      .then((blob) => URL.createObjectURL(blob));

    document.body.style.background = "black url(" + blobUrl + ")";
    document.body.style.backgroundRepeat = "no-repeat";

    if (isMobile) {
      document.body.style.backgroundSize = "auto";
      document.body.style.backgroundPosition = "50% 0%";
      document.body.style.backgroundAttachment = "scroll";
    } else {
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "50% 50%";
      document.body.style.backgroundAttachment = "fixed";
    }
  }

  calcFPS({ count: 144 });

  window.app = new window.Vue({
    el: "#app",
    data: store,
    async mounted() {
      const self = this;
      const savedSettings = JSON.parse(window.localStorage.getItem("settings"));

      if (savedSettings && savedSettings.version === this.settings.version) {
        this.settings = savedSettings;
      } else {
        window.localStorage.setItem("settings", JSON.stringify(this.settings));
      }

      try {
        document.createEvent("TouchEvent");
        this.isTouch = true;
      } catch {
        this.isTouch = false;
      }

      await this.updateBackground();

      this.initBackgroundInterval();
      this.initCountDownDate();
      this.initHiddenBar();
      this.initListeners();
      this.initToastStyles();
      this.updateMusic();
      this.fadingLoop();

      setTimeout(function () {
        self.toastStyle.visibility = "hidden";
      }, 5000);

      sparks();

      // Select platform on first visit to correctly calculate the release time
      if (this.settings.console === "") {
        this.settings.console = "true";
        await this.platformChooser();
      }
    },
    watch: {
      settings: {
        handler() {
          this.updateTextStyle();
          window.localStorage.setItem(
            "settings",
            JSON.stringify(this.settings)
          );
        },
        deep: true,
      },
      "settings.backgroundImage"() {
        if (this.settings.backgroundImage) {
          this.updateBackground();
        } else {
          document.body.style.background = "black";
        }
      },
      "settings.maxTextOpacity"() {
        if (this.fading) return;
        this.textStyle.opacity = this.settings.maxTextOpacity;
      },
      "settings.music"() {
        this.updateMusic();
      },
      "settings.uncompressedImages"() {
        this.updateBackground();
      },
      countdownUpdate() {
        this.countdown = {
          days: Math.floor(this.distance() / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (this.distance() % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor(
            (this.distance() % (1000 * 60 * 60)) / (1000 * 60)
          ),
          seconds: Math.floor((this.distance() % (1000 * 60)) / 1000),
        };
      },
      "settings.volume"() {
        if (this.musicPlayer != null)
          this.musicPlayer.volume = this.settings.volume / 100;
      },
      "settings.console"() {
        this.initCountDownDate();
      },
    },
    methods: {
      applyTextStylePreset(defaultPreset) {
        this.settings.textBrightness = 1.25;
        this.settings.maxTextOpacity = 1;
        this.textStyle.opacity = 1;
        if (defaultPreset) {
          this.settings.dropShadowColor = "";
          this.settings.dropShadowX = 0;
          this.settings.dropShadowY = 0;
          this.settings.dropShadowBlur = 0;
        } else {
          this.settings.dropShadowColor = "black";
          this.settings.dropShadowX = 2;
          this.settings.dropShadowY = 2;
          this.settings.dropShadowBlur = 3;
        }
      },
      countdownLoop() {
        this.countdownUpdate++;

        if (this.distance() <= 0) {
          if (!released) {
            this.settings.music = "resources/music/timothy-richards.mp3";
            this.updateMusic();
            released = true;
          }
        } else {
          return this.countdownLoop;
        }
      },
      fadingLoop() {
        if (!this.lastFrameTime) this.lastFrameTime = Date.now();
        const deltaTime = Date.now() - this.lastFrameTime;
        const increment = (0.007 * deltaTime) / 16;

        if (this.contentOpacity > 1) {
          this.contentOpacity = 1;
          this.fading = false;
          return;
        }

        if (this.textStyle.opacity >= this.settings.maxTextOpacity) {
          this.textStyle.opacity = this.settings.maxTextOpacity;
          this.toastStyle.opacity = this.settings.maxTextOpacity;
        } else {
          this.textStyle.opacity =
            parseFloat(this.textStyle.opacity) + increment;
          this.toastStyle.opacity =
            parseFloat(this.textStyle.opacity) + increment;
        }

        requestAnimFrame(this.fadingLoop);
        this.contentOpacity += increment;
        this.lastFrameTime = Date.now();
      },
      async iframeClick(src) {
        if (this.musicPlayer !== null) this.musicPlayer.pause();

        if (this.isTouch) {
          window.open(src);
        } else {
          this.iframeUrl = src;
          this.initIframe();

          window.Swal.fire({
            html: await iframeHtml,
            showConfirmButton: false,
            background: "rgba(0,0,0,0)",
          }).then((value) => {
            this.menuVisible = value;
            if (this.musicPlayer !== null) this.musicPlayer.play();
          });
          this.$nextTick(swalIframeMount);

          this.toastStyle.visibility = "hidden";
          this.hiddenBarVisible = false;
          this.menuVisible = false;
        }
      },
      initBackgroundInterval() {
        setInterval(() => {
          if (this.today !== new Date().getDay()) {
            this.today = new Date().getDay();
            this.updateBackground();
          }
        }, 1000);
      },
      initCountDownDate() {
        // Set release time according to daylight saving
        if (
          new Date().getTime() > new Date("Oct 31, 2021 04:00:00").getTime()
        ) {
          // Change between local release time (consoles) and global UTC release time (steam)
          if (this.settings.console === "true") {
            // Local time
            this.countDownDate = new Date("May 30, 2025 00:00:00").getTime();
          } else {
            // Global UTC
            this.countDownDate = new Date("May 29, 2025 22:00:00").getTime();
          }
        } else {
          if (this.settings.console === "true") {
            this.countDownDate = new Date("May 29, 2025 23:00:00").getTime();
          } else {
            this.countDownDate = new Date("May 29, 2025 21:00:00").getTime();
          }
        }

        this.untilInterval = setInterval(this.countdownLoop(), 1000);
      },
      initHiddenBar() {
        if (this.isTouch) {
          const mc = new window.Hammer.Manager(document.body, {
            recognizers: [
              [window.Hammer.Swipe, { direction: window.Hammer.DIRECTION_ALL }],
            ],
          });

          mc.on("swipeup", () => {
            this.hiddenBarVisible = true;
            this.toastStyle.visibility = "hidden";
          });

          mc.on("swipedown", () => {
            if (!this.hiddenBarVisible) {
              window.location.reload();
            } else {
              this.hiddenBarVisible = false;
            }
          });
        } else {
          document.body.onmousemove = (e) => {
            if (!(this.menuVisible && window.app.settings.hiddenBar)) {
              this.hiddenBarVisible = false;
              return;
            }

            const pos = { x: e.clientX, y: e.clientY };
            if (
              pos.y < window.innerHeight - 100 &&
              this.settings.topBar !== "true"
            ) {
              this.hiddenBarVisible = false;
              return;
            } else if (pos.y > 100 && this.settings.topBar === "true") {
              this.hiddenBarVisible = false;
              return;
            }

            this.toastStyle.visibility = "hidden";
            this.hiddenBarVisible = true;
          };
        }
      },
      initIframe() {
        this.iframeWidth = window.innerWidth * 0.75;
        this.iframeHeight = window.innerWidth * 0.75 * (9 / 16);

        if (this.iframeHeight > window.innerHeight) {
          this.iframeWidth = (window.innerHeight * 0.75) / (9 / 16);
          this.iframeHeight = window.innerHeight * 0.75;
        }
      },
      initListeners() {
        if (!(this.settings.hiddenBar || this.isTouch))
          this.toastMessage = "press esc to re-enable the bottom bar";

        // Toggle hidden bar with ESC
        document.addEventListener("keydown", (e) => {
          if (e.code === "Escape") {
            this.settings.hiddenBar = !this.settings.hiddenBar;
          }
        });

        // Play music upon user interaction
        document.body.addEventListener(
          "mousemove",
          () => this.musicPlayer?.currentTime === 0 && this.musicPlayer?.play()
        );
        document.body.addEventListener(
          "click",
          () => this.musicPlayer?.currentTime === 0 && this.musicPlayer?.play()
        );
        document.body.addEventListener(
          "keydown",
          () => this.musicPlayer?.currentTime === 0 && this.musicPlayer?.play()
        );

        // Resize iframes based on window resize
        window.addEventListener("resize", () => {
          this.initIframe();
        });
      },
      initToastStyles() {
        this.toastStyle.filter =
          "brightness(" +
          this.settings.textBrightness +
          ") drop-shadow(" +
          this.settings.dropShadowColor +
          " " +
          this.settings.dropShadowX +
          "px " +
          this.settings.dropShadowY +
          "px " +
          this.settings.dropShadowBlur +
          "px";
        this.toastStyle.bottom = this.settings.topBar === "true" ? "" : "30px";
        this.toastStyle.top = this.settings.topBar === "true" ? "30px" : "";

        if (this.isTouch) {
          this.toastStyle.left = "48%";
          this.toastMessage = "swipe up for info and settings";
        } else {
          this.toastStyle.left = "49%";
          this.toastStyle.fontSize = "20px";
          this.toastMessage =
            "move the mouse cursor here for info and settings";
        }
      },
      async settingsClick() {
        window.Swal.fire({
          html: await swalSettingsHtml,
          showConfirmButton: false,
          background: "rgba(50,50,50,1)",
        }).then((value) => {
          this.menuVisible = value;
        });
        this.$nextTick(swalSettingsMount);

        this.toastStyle.visibility = "hidden";
        if (!this.isTouch) this.hiddenBarVisible = false;
        this.menuVisible = false;
      },
      async textEditorClick(recall) {
        window.Swal.fire({
          html: await swalEditorHtml,
          showConfirmButton: false,
          background: "rgba(50,50,50,1)",
          position: "top-end",
          showClass: {
            popup: recall ? "" : "swal2-show",
            backdrop: "",
          },
        }).then((value) => {
          this.menuVisible = value;
        });
        this.$nextTick(swalEditorMount);
      },
      async updateBackground() {
        if (!this.settings.backgroundImage) return;

        const uncompressed = this.settings.uncompressedImages ? "-u" : "";
        const url = "resources/backgrounds/nightreign/" + rand(1, 10) + ".jpg";

        await window
          .fetch(url, { method: "HEAD" })
          .then((res) =>
            res.ok ? url : "resources/backgrounds/nightreign/" + rand(1, 10) + ".jpg"
          )
          .then((url) => setBackground(url, this.isMobile));
      },
      updateTextStyle() {
        this.textStyle.filter =
          "brightness(" +
          this.settings.textBrightness +
          ") drop-shadow(" +
          this.settings.dropShadowColor +
          " " +
          this.settings.dropShadowX +
          "px " +
          this.settings.dropShadowY +
          "px " +
          this.settings.dropShadowBlur +
          "px)";
      },
      updateMusic() {
        try {
          this.musicPlayer.pause();
          this.musicPlayer.currentTime = 0;
        } catch {}

        if (!(this.settings.music === "none")) {
          this.musicPlayer = new window.Audio(this.settings.music);
          this.musicPlayer.loop = true;
          this.musicPlayer.volume = this.settings.volume / 100;
        } else this.musicPlayer = null;
      },
      formatValue(value, name) {
        return `${value} ${name}${value === 1 ? "" : "s"}`;
      },
      distance() {
        if (this.settings.console === "true") {
          return this.countDownDate - new Date().getTime();
        } else {
          return this.countDownDate - new Date().getUTCTime();
        }
      },
      secondsRemaining() {
        return this.distance() <= 60 * 1000;
      },
      async platformChooser() {
        window.Swal.fire({
          html: await swalPlatformHtml,
          showConfirmButton: true,
          background: "rgba(50,50,50,1)",
          allowOutsideClick: false,
          confirmButtonColor:
            "rgb(var(--pure-material-primary-rgb, 33, 150, 243))",
        }).then((value) => {
          this.menuVisible = value;
        });
        this.$nextTick(swalPlatformMount);
      },
    },
  });
})();
