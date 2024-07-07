// load Vue.js and font
await new Promise(async resolve => {
  // determine current IP location to decide which sources to use
  const m = document.cookie.match(/(?:^|;)\s*ipCountryCode=([^;]*)/)
  if (m && m[1]) load({ countryCode: m[1] })
  else {
    try {
      window._ipApiCallback = load
      await loadScript(
        "http://ip-api.com/json/?fields=2&callback=_ipApiCallback"
      )
    } catch (_) {
      load()
    }
  }

  async function load(o) {
    if (o) document.cookie = "ipCountryCode=" + o.countryCode
    const isChinaMainland = o ? o.countryCode === "CN" : false
    await loadScript(
      // currently CDNJS seems to work well enough both in and outside China
      isChinaMainland
        ? "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.14/vue.global.prod.js"
        : "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.14/vue.global.prod.js"
    )
    loadStyle(
      `https://${
        isChinaMainland ? "fonts.font.im" : "fonts.googleapis.com"
      }/css2?family=Comfortaa:wght@300;700&display=swap`
    )
    resolve()
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const e = document.createElement("script")
      e.src = src
      e.addEventListener("load", () => resolve())
      e.addEventListener("error", () => reject())
      document.head.appendChild(e)
    })
  }
  function loadStyle(href) {
    const e = document.createElement("link")
    e.rel = "stylesheet"
    e.href = href
    document.head.appendChild(e)
  }
})

import App from "./components/App.js"

let app = Vue.createApp(App, {
  showAutomationNotice: true,
})

app.mount("#app")

function updateMusicOnly() {
  if (location.hash === "#musiconly")
    document.getElementById("app").classList.add("musiconly")
  else document.getElementById("app").classList.remove("musiconly")
}
window.onhashchange = updateMusicOnly
updateMusicOnly()
