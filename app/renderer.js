(function() {
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
  const Styles = {
    start_state_color: {border: 'green', background: 'rgb(150,255,150)'},
    end_state_color: {border: 'red', background: 'rgb(255,150,150)'}
  }

  function render_nfa_to_network_data(nfa) {
    const nodes = []
    const edges = []
    const {transition_map} = nfa
  
    nfa.travel((state) => {
      let node = {id: state.id, label: ' ', shape: 'circle'}
      // start state
      if (nodes.length === 0) {
        node.color = Styles.start_state_color
      }
      if (state.transitions.length) {
        state.transitions.forEach(addEdge)
      } else { // end state
        node.color = Styles.end_state_color
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

  function render_dfa_to_network_data(dfa) {
    const nodes = []
    const edges = []
    const {start, end, states, transitions} = dfa

    states.forEach((state) => {
      const node = {id: state, label: ' ', shape: 'circle'}
      if (state === start) {
        node.color = Styles.start_state_color
      } else if (end.indexOf(state) > -1) {
        node.color = Styles.end_state_color
      }
      nodes.push(node)
    })

    transitions.forEach((transition) => {
      const {from, to, input} = transition
      edges.push({
        from,
        to,
        label: input,
        arrows: 'to',
        color: {color: 'gray'},
        font: {align: 'horizontal', color: 'rgb(255,0,0)'}
      })
    })

    return {nodes, edges}
  }

  window.renderer = {
    render_nfa_to_network_data,
    render_dfa_to_network_data,
    NETWORK_OPTIONS
  }
})()