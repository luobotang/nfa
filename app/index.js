(function() {
  const vis = window.vis
  const {NFA, DFA} = window.lib
  const {NETWORK_OPTIONS, render_nfa_to_network_data, render_dfa_to_network_data} = window.renderer

  let network_nfa = null
  let network_dfa = null

  document.querySelector('#regexp').addEventListener('input', invokeLater(render))
  document.querySelector('#action').addEventListener('click', render)
  
  render() // init
  
  function invokeLater(fn, delay = 200) {
    let timer
    return () => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(), delay)
    }
  }
  
  function render() {
    const regexp = document.querySelector('#regexp').value
    const nfa = NFA.createFromRegexp(regexp)
    const dfa = DFA.createFromNFA(nfa)

    const data_nfa = render_nfa_to_network_data(nfa)
    if (!network_nfa) {
      network_nfa = new vis.Network(document.querySelector('#canvas-nfa'), data_nfa, NETWORK_OPTIONS)
    } else {
      network_nfa.setData(data_nfa)
    }

    const data_dfa = render_dfa_to_network_data(dfa)
    if (!network_dfa) {
      network_dfa = new vis.Network(document.querySelector('#canvas-dfa'), data_dfa, NETWORK_OPTIONS)
    } else {
      network_dfa.setData(data_dfa)
    }
  }
})()