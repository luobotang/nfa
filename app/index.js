(function() {
  const VIS = window.vis
  const LIB = window.lib

  const NETWORK_OPTIONS = {
    layout: {
      randomSeed: 4 // 固定seed，确保相同数据每次绘制结果不变，选择4时缺省数据显示效果较好
    },
    nodes: {
      font: {
        color: '#333333',
        bold: {
          color: '#ff3333'
        }
      },
      color: {
        border: '#333333',
        background: '#f0f0f0',
        highlight: {
          border: '#ff3333',
          background: '#fff0f0'
        }
      }
    },
    edges: {
      arrows: {
        to: true
      },
      color: {
        color: '#dddddd',
        highlight: '#ffcccc'
      }
    }
  }
  const STYLES = {
    start_state_color: {border: 'green', background: 'rgb(150,255,150)'},
    end_state_color: {border: 'red', background: 'rgb(255,150,150)'}
  }
  
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
    const nfa = LIB.NFA.createFromeRegex(regexp)
    const data_nfa = drawNfa(nfa)
    const dfa = LIB.DFA.createFromNFA(nfa)
    const data_dfa = drawDfa(dfa)
    if (!network_nfa) {
      network_nfa = new VIS.Network(document.querySelector('#canvas-nfa'), data_nfa, NETWORK_OPTIONS)
      network_dfa = new VIS.Network(document.querySelector('#canvas-dfa'), data_dfa, NETWORK_OPTIONS)
    } else {
      network_nfa.setData(data_nfa)
      network_dfa.setData(data_dfa)
    }
  }
  
  function drawNfa(nfa) {
    const nodes = []
    const edges = []
    const {transition_map} = nfa
  
    nfa.travel((state) => {
      let node = {id: state.id, label: ' ', shape: 'circle'}
      // start state
      if (nodes.length === 0) {
        node.color = STYLES.start_state_color
      }
      if (state.transitions.length) {
        state.transitions.forEach(addEdge)
      } else { // end state
        node.color = STYLES.end_state_color
      }
      nodes.push(node)
    })
  
    function addEdge(id) {
      const transiton = transition_map.get(id)
      const {from, to, input} = transiton
      const isEpsilon = input === ''
      edges.push({
        from,
        to,
        label: isEpsilon ? 'ϵ' : input,
        arrows: 'to',
        color: {color: 'gray'},
        font: isEpsilon ? {align: 'horizontal'} : {align: 'horizontal', color: 'rgb(255,0,0)'}
      })
    }
  
    return {nodes, edges}
  }

  function drawDfa(dfa) {
    const nodes = []
    const edges = []

    console.log(dfa)

    const {start, end, states, transitions} = dfa
    const start_node = {id: 'start', label: ' ', shape: 'circle', color: STYLES.start_state_color}
    const end_node = {id: 'end', label: ' ', shape: 'circle', color: STYLES.end_state_color}

    nodes.push(start_node, end_node)
    states.forEach((state) => {
      if (state === start || end.indexOf(state) > -1) return
      nodes.push({id: state, label: ' ', shape: 'circle'})
    })

    transitions.forEach((transition) => {
      const {from, to, input} = transition
      edges.push({
        from: from === start ? 'start' : from,
        to: end.indexOf(to) > -1 ? 'end' : to,
        label: input,
        arrows: 'to',
        color: {color: 'gray'},
        font: {align: 'horizontal', color: 'rgb(255,0,0)'}
      })
    })

    return {nodes, edges}
  }
})()