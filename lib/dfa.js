class DFA {
  static createFromNFA(nfa) {
    const {start, state_map, transition_map} = nfa
    const all_inputs = getAllInputs()
    const states_visited = new Set()
    const states_set = new Set()
    const states_transitions = [
      // {from: states, to: states, input: input}
    ]

    let start_states = epsilonClosure([start])
    states_set.add(start_states)

    let states
    while (states = getNotVisitedStates()) {
      states_visited.add(states)
      for (let input of all_inputs) {
        let to_states = epsilonClosure(move(states, input))
        if (!to_states) continue // empty
        if (!states_visited.has(to_states)) {
          states_set.add(to_states)
        }
        states_transitions.push({from: states, to: to_states, input})
      }
    }

    let {end: end_states_set, all: all_states} = findAllEndStates(states_transitions)

    return {
      start: start_states,
      end: Array.from(end_states_set),
      inputs: Array.from(all_inputs),
      states: all_states,
      transitions: states_transitions
    }

    function eachStatesTransition(states, callback) {
      (typeof states === 'string' ? states.split('-') : states).forEach((s_id) => {
        const state = state_map.get(+s_id) // to number!
        state.transitions.forEach((t_id) => {
          callback(state, transition_map.get(t_id))
        })
      })
    }

    function getAllInputs() {
      const inputs = new Set()
      for (let transition of transition_map.values()) {
        if (transition.input) {
          inputs.add(transition.input)
        }
      }
      return inputs
    }

    function getNotVisitedStates() {
      for (let states of states_set) {
        if (!states_visited.has(states)) return states 
      }
      return null
    }

    function epsilonClosure(states, to_set) {
      to_set = to_set || new Set()
      eachStatesTransition(states, (state, transition) => {
        if (!transition.input && !to_set.has(transition.to)) {
          to_set.add(transition.to)
          epsilonClosure([transition.to], to_set)
        }
      })
      return Array.from(to_set).sort().join('-')
    }

    function move(states, input) {
      const to_states = new Set()
      eachStatesTransition(states, (state, transition) => {
        if (transition.input === input) {
          to_states.add(transition.to)
        }
      })
      return Array.from(to_states).sort().join('-')
    }

    function findAllEndStates(states_transitions) {
      const map = new Map() // Map<states, isEndState>
      states_transitions.forEach((transition) => {
        const {from, to} = transition
        map.set(from, true)
        if (!map.get(to)) {
          map.set(to, false)
        }
      })
      const all_states = Array.from(map.keys())
      return {
        all: all_states,
        end: all_states.filter((id) => !map.get(id))
      }
    }
  }
}

module.exports = DFA