const regex2post = require('./regex2post')

/**
 * @property {number} id
 * @property {Transiton[]} transitions
 */
class State {
  /**
   * @constructor
   * @param {number} id 
   */
  constructor(id) {
    this.id = id
    this.transitions = []
  }
}

/**
 * @property {number} id
 * @property {number} from - from state's id
 * @property {number} to - to state's id
 * @property {string} input - input char
 */
class Transiton {
  /**
   * @constructor
   * @param {number} id
   * @param {number} fromStateId
   * @param {number} toStateId
   * @param {string} input 
   */
  constructor(id, fromStateId, toStateId, input) {
    this.id = id
    this.from = fromStateId
    this.to = toStateId
    this.input = input
  }
}

/**
 * @property {State} start - start state
 * @property {State} end - end state
 */
class Fragment {
  /**
   * @constructor
   * @param {State} startState 
   * @param {State} endState 
   */
  constructor(startState, endState) {
    this.start = startState
    this.end = endState
  }
}

/**
 * @property {number} start - start state's id
 * @property {number} end - end state's id
 * @property {Map<number, State>} state_map
 * @property {Map<number, Transiton>} transition_map
 */
class NFA {
  constructor() {
    this.start = -1
    this.end = -1
    this.state_map = new Map()
    this.transition_map = new Map()
  }

  toJSON() {
    const {start, end, state_map, transition_map} = this
    function map2array(map) {
      const array = []
      for (let entry of map) {
        array.push(entry)
      }
      return array
    }
    return {
      start,
      end,
      state_map: map2array(state_map),
      transition_map: map2array(transition_map)
    }
  }

  travel(callback) {
    const traveled = new Map()
    const {state_map, transition_map} = this
    
    nextState(this.start)

    function nextState(id) {
      if (traveled[id]) return

      let state = state_map.get(id)
      if (!state) return

      traveled[id] = true

      callback(state)
      const transitions = state.transitions
      if (!transitions) return

      let t = transition_map.get(transitions[0])
      if (!t) return
      nextState(t.to)

      t = transition_map.get(transitions[1])
      if (!t) return
      nextState(t.to)
    }
  }

  static createFromRegexp(str) {
    if (!str) return null
    return NFA.createFromPostfixExpression(regex2post(str))
  }

  static createFromPostfixExpression(str) {
    if (typeof str !== 'string') return null

    let uuid_state = 0
    let uuid_transition = 0

    const nfa = new NFA()
    const {state_map, transition_map} = nfa

    function newState() {
      const state = new State(uuid_state++)
      state_map.set(state.id, state)
      return state
    }
  
    function newTransition(fromState, toState, input = '') {
      const transition = new Transiton(uuid_transition++, fromState.id, toState.id, input)
      fromState.transitions.push(transition.id)
      transition_map.set(transition.id, transition)
      return transition
    }

    const frag_stack = []

    for (let ch, i = 0, len = str.length; i < len; i++) {
      ch = str[i]
      switch(ch) {
        case '|':
          {
            const f2 = frag_stack.pop()
            const f1 = frag_stack.pop()
            const start = newState()
            const end = newState()

            newTransition(start, f1.start)
            newTransition(start, f2.start)
            newTransition(f1.end, end)
            newTransition(f2.end, end)

            frag_stack.push(new Fragment(start, end))
          }
          break
        case '.':
          {
            const f2 = frag_stack.pop()
            const f1 = frag_stack.pop()

            // use f1.end replace f2.start
            // change the from state of all f2.start.transitions to f1.end
            f2.start.transitions.forEach((transition_id) => {
              const transition = transition_map.get(transition_id)
              transition.from = f1.end.id
              f1.end.transitions.push(transition_id)
            })

            // delete f2.start
            state_map.delete(f2.start.id)

            frag_stack.push(new Fragment(f1.start, f2.end))
          }
          break
        case '*':
          {
            const f = frag_stack.pop()
            const start = newState()
            const end = newState()

            newTransition(start, f.start)
            newTransition(start, end)
            newTransition(f.end, f.start)
            newTransition(f.end, end)

            frag_stack.push(new Fragment(start, end))
          }
          break;
        case '?':
          {
            const f = frag_stack.pop()
            const start = newState()
            const end = newState()

            newTransition(start, f.start)
            newTransition(start, end)
            newTransition(f.end, end)

            frag_stack.push(new Fragment(start, end))
          }
          break
        case '+':
          {
            const f = frag_stack.pop()
            const start = newState()
            const end = newState()

            newTransition(start, f.start)
            newTransition(f.end, f.start)
            newTransition(f.end, end)

            frag_stack.push(new Fragment(start, end))
          }
          break
        default:
          {
            const start = newState()
            const end = newState()

            newTransition(start, end, ch)

            frag_stack.push(new Fragment(start, end))
          }
          break
      }
    }

    const frag = frag_stack.pop()
    nfa.start = frag.start.id
    nfa.end = frag.end.id
    return nfa
  }
}

module.exports = NFA