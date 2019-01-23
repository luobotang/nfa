const State = require('./state')
const Fragment = require('./fragment')

const regex2post = require('./regex2post')

/**
 * @property {number} id
 * @property {NFATransiton[]} transitions
 */
class NFAState {
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
class NFATransiton {
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
 * @property {NFAState} start - start state
 * @property {NFAState} end - end state
 */
class NFAFragment {
  /**
   * @constructor
   * @param {NFAState} startState 
   * @param {NFAState} endState 
   */
  constructor(startState, endState) {
    this.start = startState
    this.end = endState
  }
}

/**
 * @property {number} start - start state's id
 * @property {number} end - end state's id
 * @property {Map<number, NFAState>} state_map
 * @property {Map<number, NFATransiton>} transition_map
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

  static createFromeRegex(str) {
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
      const state = new NFAState(uuid_state++)
      state_map.set(state.id, state)
      return state
    }
  
    function newTransition(fromState, toState, input = '') {
      const transition = new NFATransiton(uuid_transition++, fromState.id, toState.id, input)
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

            frag_stack.push(new NFAFragment(start, end))
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

            frag_stack.push(new NFAFragment(f1.start, f2.end))
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

            frag_stack.push(new NFAFragment(start, end))
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

            frag_stack.push(new NFAFragment(start, end))
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

            frag_stack.push(new NFAFragment(start, end))
          }
          break
        default:
          {
            const start = newState()
            const end = newState()

            newTransition(start, end, ch)

            frag_stack.push(new NFAFragment(start, end))
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

function post2nfa(str) {
  const stack = []

  State.uid = 0 // reset

  for (let ch, i = 0, len = str.length; i < len; i++) {
    ch = str[i]
    switch(ch) {
      case '|':
        {
          const e2 = stack.pop()
          const e1 = stack.pop()
          const s = new State('e')
          const o = new State('e')
          s.out = e1.start
          s.out1 = e2.start
          e1.out.out = o
          e2.out.out = o
          stack.push(new Fragment(s, o))
        }
        break
      case '.':
        {
          const e2 = stack.pop()
          const e1 = stack.pop()
          e1.out.out = e2.start
          stack.push(new Fragment(e1.start, e2.out))
        }
        break
      case '*':
        {
          const e = stack.pop()
          const s = new State('e')
          s.out = e.start
          e.out.out = s
          const o = new State('e')
          s.out1 = o
          stack.push(new Fragment(s, o))
        }
        break;
      case '?':
        {
          const e = stack.pop()
          const s = new State('e')
          s.out = e.start
          const o = new State('e')
          s.out1 = e.out.out = o
          stack.push(new Fragment(s, o))
        }
        break
      case '+':
        {
          const e = stack.pop()
          e.out.out = e.start
          const o = new State('e')
          e.out.out1 = o
          stack.push(new Fragment(e.start, o))
        }
        break
      default:
        {
          const s = new State()
          s.symbol = ch
          stack.push(new Fragment(s, s))
        }
        break
    }
  }

  const e = stack.pop()
  const o = new State('end')
  e.out.out = o

  let uid = 0
  let endState
  // - try remove useless epsilon state
  // - reset state uid
  State.travel(e.start, (s) => {
    if (s.type === 'end') {
      endState = s
      return
    }
    s.id = 10000 + (++uid) // NOTE! give a very big base number, so not same with current state id!
    while (tryRemoveEpsilonState(s)) {}
  })

  endState.id = 10000 + (++uid) // make sure the end state have the max id

  // remove the big base number
  State.travel(e.start, (s) => {
    s.id -= 10000
  })

  return e
}

function tryRemoveEpsilonState(s) {
  const next = s.out
  const next1 = s.out1
  // remove epsilon state
  if (next && next.type === 'e') {
    // s => {out: {type: 'e', ..}}
    if (!next1) {
      s.out = next.out
      s.out1 = next.out1
      return true
    }
    // s => {out: {type: 'e', out: {..}}, out1: {..}}
    if (!next.out1) {
      s.out = next.out
      return true
    }
  }
  // s => {out: {..}, out1: {type: 'e', out: {..}}}
  if (next1 && next1.type === 'e' && !next1.out1) {
    s.out1 = next1.out
    return true
  }
  return false
}

exports.NFA = NFA

exports.regex2post = regex2post

exports.post2nfa = post2nfa

exports.regex2nfa = function(str) {
  return post2nfa(regex2post(str))
}

exports.travel = function(nfa, callback) {
  // TODO
}