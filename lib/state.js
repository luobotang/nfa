class State {
  constructor(type) {
    this.id = ++State.uid
    this.type = type || 'n' // 'n' - normal | 'e' - epsilon | 'end'
    this.symbol = ''
    this.out = null
    this.out1 = null
  }
}

State.uid = 0

State.travel = function(startState, callback) {
  const processed = {}

  travel(startState)

  function travel(state) {
    if (!state || processed[state.id]) return
    callback(state)
    processed[state.id] = true // must mark processed later, callback may change state.id!
    travel(state.out)
    travel(state.out1)
  }
}

module.exports = State