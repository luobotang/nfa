(function() {
  const vis = window.vis
  const nfa = window.nfa
  
  let network = null

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
    const data = drawNfa(nfa.NFA.createFromeRegex(regexp))
    if (!network) {
      const options = {
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
      network = new vis.Network(document.querySelector('#canvas'), data, options)
    } else {
      network.setData(data)
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
        node.color = {border: 'green', background: 'rgb(150,255,150)'}
      }
      if (state.transitions.length) {
        state.transitions.forEach(addEdge)
      } else { // end state
        node.color = {border: 'red', background: 'rgb(255,150,150)'}
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
})()