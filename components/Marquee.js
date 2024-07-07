const TAU = 2 * Math.PI
export default {
  name: "Marquee",
  template: `<div class="marquee" ref="box"><slot /></div>`,
  props: {
    value: String,
  },
  setup(props) {
    const box = Vue.ref(null)
    const f = x => (1 - Math.cos(TAU * x)) / 2
    const interval = 8000

    let time = 0
    let clientWidth = 0
    let scrollWidth = 0
    let handle = null

    Vue.onMounted(() => {
      let prev = null
      handle = requestAnimationFrame(function cb(now) {
        if (prev !== null) time += now - prev
        prev = now
        handle = requestAnimationFrame(cb)
        if (!box.value) return

        const newScrollWidth = box.value.scrollWidth
        const newClientWidth = box.value.clientWidth
        if (newScrollWidth !== scrollWidth || newClientWidth !== clientWidth) time = 0

        scrollWidth = newScrollWidth
        clientWidth = newClientWidth
        if (scrollWidth > clientWidth)
          box.value.scrollLeft = (scrollWidth - clientWidth) * f(time / interval)
      })
    })
    Vue.onBeforeUnmount(() => {
      handle && cancelAnimationFrame(handle)
    })

    return { box }
  },
}
