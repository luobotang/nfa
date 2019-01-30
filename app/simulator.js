(function() {
  const vis = window.vis
  const {NFA} = window.lib
  const {NETWORK_OPTIONS, render_nfa_to_network_data} = window.renderer
  const {run: run_simulator} = window.simulator_step

  const network = new vis.Network(document.querySelector('#canvas'), {nodes: [], edges: []}, NETWORK_OPTIONS)

  let running = false
  let nextStep = null
  let currentNfa = null

  const el_regx = document.getElementById('input-regx')
  const el_text = document.getElementById('input-text')
  const el_result = document.getElementById('result')

  el_regx.addEventListener('input', invokeLater(render))
  document.getElementById('btn-run').addEventListener('click', run)
  document.getElementById('btn-stop').addEventListener('stop', stop)

  render()
  
  function invokeLater(fn, delay = 200) {
    let timer
    return () => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(), delay)
    }
  }

  function render() {
    const regexp = el_regx.value
    const nfa = currentNfa = NFA.createFromRegexp(regexp)
    const data = render_nfa_to_network_data(nfa)
    network.setData(data)
  }

  function run() {
    el_regx.disabled = true
    el_text.disabled = true

    if (running) {
      nextStep()
    } else {
      running = true
      run_simulator(currentNfa, el_text.value, (state, next) => {
        if (!next) {
          updateState(state)
          stop()
          return
        }
        updateState(state)
        nextStep = next
      })
    }
  }

  function updateState(state) {
    if (state.states.size === 0) return
    const nodes = Array.from(state.states).map((s) => s.id)
    console.log(nodes)
    network.setSelection({nodes}, {highlightEdges: false})
    el_result.innerHTML = `step: <b>${state.step}</b><br>next char: <b>${state.char || ''}</b><br>result: <b>${state.result}</b>`
  }

  function stop() {
    el_regx.disabled = false
    el_text.disabled = false
    running = false
  }
})()