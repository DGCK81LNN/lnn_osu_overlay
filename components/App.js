import Background from "./Background.js"
import Marquee from "./Marquee.js"

const app = {
  name: "App",
  components: {
    Background,
    Marquee,
  },
  props: {
    showAutomationNotice: false,
    showUnicodeFirst: false,
    showSources: false,
  },
  setup(props, context) {
    const data = Vue.reactive({
      tokens: {},
      rws: {},
    })

    const getToken = (tokenName, decimalPlaces) =>
      _GetToken(data.rws, data.tokens, tokenName, decimalPlaces)

    const isPlayingOrWatching = Vue.computed(() => {
      return _IsInStatus(data.rws, data.tokens, [
        overlay.osuStatus.Playing,
        overlay.osuStatus.Watching,
        overlay.osuStatus.ResultsScreen,
      ])
    })

    //either request all tokens upfront by filling their names in array
    //or request them later using helper getToken method above
    data.rws = watchTokens([], values => {
      Object.assign(data.tokens, values)
    })

    const formatDur = secs => {
      secs = Math.floor(secs)
      return `${Math.floor(secs / 60).pad()}:${Math.floor(secs % 60).pad()}`
    }

    const isResultScreen = Vue.computed(() =>
      [
        overlay.rawOsuStatus.ResultsScreen,
        overlay.rawOsuStatus.MultiplayerResultsscreen,
      ].includes(getToken("rawStatus"))
    )

    let _sliderBreaks = 0
    const getSliderBreaks = () => {
      if (isResultScreen.value) return _sliderBreaks
      return (_sliderBreaks = getToken("sliderBreaks"))
    }

    let _bpm = 0
    const bpm = Vue.computed(() => {
      const newBpm = getToken("currentBpm")
      if (newBpm == 0) return _bpm
      return (_bpm = newBpm)
    })

    const stats = Vue.computed(() => {
      switch (getToken("gameMode")) {
        case "Osu":
          return {
            great: getToken("c300"),
            ok: getToken("c100"),
            meh: getToken("c50"),
            miss: getToken("miss"),
            sliderbreak: getSliderBreaks(),
          }
        case "Taiko":
          return {
            great: getToken("c300"),
            ok: getToken("c100"),
            miss: getToken("miss"),
          }
        case "CatchTheBeat":
          return {
            fruits: getToken("c300"),
            ldrops: getToken("c100"),
            sdrops: getToken("c50"),
            miss: getToken("miss"),
          }
        case "OsuMania":
          return {
            perfect: getToken("geki"),
            great: getToken("c300"),
            good: getToken("katsu"),
            ok: getToken("c100"),
            meh: getToken("c50"),
            miss: getToken("miss"),
          }
        default:
          return {
            great: getToken("c300"),
            ok: getToken("c100"),
            meh: getToken("c50"),
            miss: getToken("miss"),
          }
      }
    })

    const grade = Vue.computed(() => {
      return overlay.osuGrade[getToken("grade")]
    })

    const unicode = Vue.ref(props.showUnicodeFirst)
    let unicodeSwitchInterval
    const artistTitle = Vue.computed(() => {
      let artist = unicode.value ? getToken("artistUnicode") : getToken("artistRoman")
      if (props.showSources) {
        const source = getToken("source")
        artist = source ? `${source} (${artist})` : artist
      }
      return `${artist} - ${unicode.value ? getToken("titleUnicode") : getToken("titleRoman")}`
    })
    Vue.watch(() => ({
      source: props.showSources ? getToken("source") : "",
      titleRoman: getToken("titleRoman"),
      titleUnicode: getToken("titleUnicode"),
      artistRoman: getToken("artistRoman"),
      artistUnicode: getToken("artistUnicode"),
    }), () => {
      unicode.value = props.showUnicodeFirst
      clearInterval(unicodeSwitchInterval)
      unicodeSwitchInterval = setInterval(() => {
        unicode.value = !unicode.value
      }, 8000)
    })

    return {
      getToken,
      isPlayingOrWatching,
      formatDur,
      artistTitle,
      stats,
      grade,
      bpm,
      isResultScreen,
    }
  },
}

export default app
