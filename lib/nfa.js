const State = require('./state')
const Fragment = require('./fragment')

const OperatorPriority = {
  '*': 4,
  '?': 4,
  '+': 4,
  '.': 3,
  '|': 2,
  '(': 1
}

// use: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
function regex2post(str) {
  const output = []
  const ops = []

  for (let ch, i = 0, is_last_ch = false, len = str.length; i < len; i++) {
    ch = str[i]

    if (ch === '*' || ch === '?' || ch === '+') {
      pushOperator(ch)
      is_last_ch = true // !
      continue
    }

    if (ch === '|') {
      pushOperator(ch)
      is_last_ch = false
      continue
    }

    if (ch === '(') {
      if (is_last_ch) { // !
        pushOperator('.')
      }
      ops.push(ch)
      is_last_ch = false
      continue
    }

    if (ch === ')') {
      let op
      while (op = ops.pop()) {
        if (op === '(') {
          break
        }
        output.push(op)
      }
      if (op !== '(') {
        throw new Error(`no "(" match ")" at [${i}] of "${str}"`)
      }
      is_last_ch = true
      continue
    }

    // normal char
    if (is_last_ch) {
      pushOperator('.')
    }
    output.push(ch)
    is_last_ch = true
  }

  function pushOperator(op) {
    let top
    const priority = OperatorPriority[op]
    while (top = ops.pop()) {
      if (OperatorPriority[top] >= priority) {
        output.push(top)
      } else {
        ops.push(top)
        break
      }
    }
    ops.push(op)
  }

  let op
  while (op = ops.pop()) {
    if (op === '(') {
      throw new Error(`not matched "(" of "${str}"`)
    }
    output.push(op)
  }

  return output.join('')
}

function regex2pos1t(str) {
  const ex_stack = []
  const op_stack = []

  for (let ch, i = 0, len = str.length; i < len; i++) {
    ch = str[i]
    switch(ch) {
      case '|':
        check_op()
        op_stack.push('|')
        ex_stack.push('')
        break
      case '*':
      case '?':
      case '+':
        {
          const e = ex_stack.pop()
          ex_stack.push(e + ch)
        }
        break
      case '(':
        {
          ex_stack.push('')
        }
        break
      case ')':
        check_op()
        break
      default: // a-z0-9
        // TODO fixbug: should check next char *?+ first!
        {
          const e = ex_stack.pop()
          if (e) {
            ex_stack.push(e + ch + '.')
          } else {
            ex_stack.push(ch)
          }
        }
        break
    }
  }

  function check_op() {
    op = op_stack.pop()
    if (op) { // |
      const e2 = ex_stack.pop()
      const e1 = ex_stack.pop()
      ex_stack.push(e1 + e2 + op) // [...,'a', 'b'] -> [..., 'ab|']
    } else if (ex_stack.length === 2) { // need union
      const e2 = ex_stack.pop()
      const e1 = ex_stack.pop()
      ex_stack.push(e1 + e2 + '.')
    }
  }

  check_op()

  return ex_stack.join('')
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
          const o = new State('e')
          e2.out.out = o
          stack.push(new Fragment(e1.start, o))
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
          const s = new State('e')
          s.out = e.start
          e.out.out = s
          const o = new State('e')
          s.out1 = o
          stack.push(new Fragment(e.start, o))
        }
        break
      default:
        {
          const s = new State()
          s.symbol = ch
          const o = new State('e')
          s.out = o
          stack.push(new Fragment(s, o))
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

exports.regex2post = regex2post

exports.post2nfa = post2nfa

exports.regex2nfa = function(str) {
  return post2nfa(regex2post(str))
}
