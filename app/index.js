const vis = require('vis')
const nfa = require('..')

window.nfa = nfa // for debug

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
  new vis.Network(document.querySelector('#canvas'), drawNfa(nfa.regex2nfa(regexp)), {})
}

function drawNfa(nfa) {
  const nodes = [{id: '0', label: '0', color: {border: 'green', background: 'rgb(150,255,150)'}}]
  const edges = []

  addEdge({id: 0}, nfa.start)

  window.nfa.travelState(nfa.start, (state) => {
    if (state.type === 'end') {
      nodes.push({id: state.id, label: '' + state.id, color: {border: 'red', background: 'rgb(255,150,150)'}})
      return
    }
    nodes.push({id: state.id, label: '' + state.id})
    addEdge(state, state.out)
    addEdge(state, state.out1)
  })

  function addEdge(s1, s2) {
    if (!s1 || !s2) return
    const isTypeE = s2.type === 'e'
    edges.push({
      from: s1.id,
      to: s2.id,
      label: isTypeE ? 'ε' : (s2.symbol || ''),
      arrows: 'to',
      color:{color:'gray'},
      font: isTypeE ? {align: 'horizontal'} : {align: 'horizontal', color: 'rgb(255,0,0)'}
    })
  }

  return {nodes, edges}
}
