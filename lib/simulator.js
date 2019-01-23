exports.run = function(nfa, str) {
  const {state_map, transition_map} = nfa
  let current_states = new Set()
  let next_states = new Set()

  addState(current_states, state_map.get(nfa.start))

  for (let ch, i = 0, len = str.length; i < len; i++) {
    ch = str[i]
    step(ch)
    let tmp = current_states
    current_states = next_states
    next_states = tmp
  }

  function step(ch) {
    next_states.clear()
    current_states.forEach((state) => {
      // input transition's from state only have 1 transition
      if (state.transitions.length !== 1) return
      let transition = transition_map.get(state.transitions[0])
      if (transition.input === ch) {
        addState(next_states, state_map.get(transition.to))
      }
    })
  }

  function addState(set, state) {
    if (!state || set.has(state) > -1) {
      return
    }

    // epsilon transition
    if (isEpsilonTransition(state.transitions[0])) {
      addState(set, getTransitionToState(state.transitions[0]))
      addState(set, getTransitionToState(state.transitions[1]))
    } else {
      set.add(state)
    }
  }

  function isEpsilonTransition(transition) {
    if (!transition) return false
    return !!transition.input
  }

  function getTransitionToState(transition_id) {
    if (!transition_id) return null
    return state_map.get(transition_map.get(transition_id).to)
  }

  // check if end state in current_states
  for (let state of current_states) {
    if (state.transitions.length === 0) return true
  }
  return false
}
