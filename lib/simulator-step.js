exports.run = function(nfa, str, onStep) {
  const {state_map, transition_map} = nfa
  let current_states = new Set()
  let next_states = new Set()

  addState(current_states, state_map.get(nfa.start))

  let ch, i = 0, len = str.length

  callOnStep()

  function callOnStep() {
    const finished = i >= len || current_states.size === 0
    onStep({
      step: i,
      char: str[i],
      states: current_states,
      result: finished ? getResult() : undefined
    }, finished ? null : next)
  }

  function next() {
    ch = str[i]
    step(ch)
    let tmp = current_states
    current_states = next_states
    next_states = tmp
    i++
    callOnStep()
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
    if (!state || set.has(state)) {
      return
    }

    // epsilon transition
    if (isEpsilonTransition(transition_map.get(state.transitions[0]))) {
      addState(set, getTransitionToState(state.transitions[0]))
      addState(set, getTransitionToState(state.transitions[1]))
    } else {
      set.add(state)
    }
  }

  function isEpsilonTransition(transition) {
    if (!transition) return false
    return !transition.input
  }

  function getTransitionToState(transition_id) {
    if (transition_id === undefined) return null
    return state_map.get(transition_map.get(transition_id).to)
  }

  function getResult() {
    // check if end state in current_states
    for (let state of current_states) {
      if (state.transitions.length === 0) return true
    }
    return false
  }
}

exports.runWithBacktrack = function(nfa, str, onStep) {
  const {state_map, transition_map} = nfa
  const transition_path = [] // [transition_id, ...]

  let char_index = 0
  let current_state = state_map.get(nfa.start)
  let next_transition = transition_map.get(current_state.transitions[0])

  const NEXT = 1
  const BACK = -1
  const FINISH = 0

  let step = 0

  callOnStep()

  function callOnStep(finished) {
    onStep({
      step: step++,
      char: str[char_index],
      states: [current_state],
      result: finished ? getResult() : undefined
    }, finished ? null : next)
  }

  function next() {
    let result = forward()
    if (result === BACK) {
      if (back() === FINISH) {
        callOnStep(true)
        return
      }
    } else if (result === FINISH) {
      callOnStep(true)
      return
    }
    callOnStep()
  }

  function forward() {
    if (!next_transition) return BACK
    // epsilon
    if (!next_transition.input) {
      transition_path.push(next_transition)
      current_state = state_map.get(next_transition.to)
      next_transition = transition_map.get(current_state.transitions[0])
      return NEXT
    }
    if (next_transition.input === str[char_index]) {
      char_index++
      transition_path.push(next_transition)
      current_state = state_map.get(next_transition.to)
      if (char_index === str.length) {
        return FINISH
      } else {
        next_transition = transition_map.get(current_state.transitions[0])
        return NEXT
      }
    } else {
      // not match
      return BACK
    }
  }

  function back() {
    if (!current_state) return FINISH
    const last_transition_id = current_state.transitions[1]
    // already try all transitions
    if (last_transition_id === undefined || last_transition_id === next_transition.id) {
      // go back
      next_transition = transition_path.pop()
      if (!next_transition) {
        current_state = null
        return FINISH
      }
      // move back if has valid input char
      if (next_transition.input) {
        char_index--
      }
      current_state = state_map.get(next_transition.from)
      return back()
    }
    next_transition = transition_map.get(last_transition_id)
    return NEXT
  }

  function getResult() {
    // check if current state is end state, or can go directly to end state only with epsilon transitions

    const reachable_states = new Set()
  
    addState(current_state)

    function addState(state) {
      if (!state) return
      if (reachable_states.has(state)) return
      reachable_states.add(state)
      state.transitions.forEach((id) => {
        // only add epsilon transiton's to state
        let transition = transition_map.get(id)
        if (transition.input === '') {
          addState(state_map.get(transition.to))
        }
      })
    }

    let matched = false
    reachable_states.forEach((state) => {
      // end state
      if (state.transitions.length === 0) {
        matched = true
      }
    })
    return matched
  }
}
