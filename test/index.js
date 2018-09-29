const assert = require('assert')
const { regex2post, post2nfa, regex2nfa } = require('../lib/nfa')
const { match } = require('../lib/simulator')

describe('regexp -> nfa', function() {
  it('should convert regexp to postfix', function() {
    assert(regex2post('ab'), 'ab.')
    assert(regex2post('a|b'), 'ab|')
    assert(regex2post('a|b|c'), 'ab|c|')
    assert(regex2post('a*b'), 'a*b.')
    assert(regex2post('a?b'), 'a?b.')
    assert(regex2post('a+b'), 'a+b.')
    assert(regex2post('ab+|cd'), 'ab.+')
    assert(regex2post('(a|b)c'), 'ab|c.')
    assert(regex2post('abc'), 'ab.c.')
    assert(regex2post('(a|b)(c|d)'), 'ab|cd|.')
    assert(regex2post('ab?'), 'ab?.')
    assert(regex2post('(a|b)c?'), 'ab|c?.')
    assert(regex2post('(a+|b)c'), 'a+b|c.')
  })

  it('should convert postfix to nfa', function() {
    const nfa = post2nfa('ab|c.')
    console.log('ab|c.')
    console.log(printNfa(nfa))

    console.log('a+b.')
    console.log(printNfa(post2nfa('a+b.')))

    console.log('a+b|c.')
    console.log(printNfa(post2nfa('a+b|c.')))

    console.log('a*b|c.')
    console.log(printNfa(post2nfa('a*b|c.')))
  })
})

function printNfa(nfa) {
  const stack = {}
  return printState(nfa.start, 0)

  function printState(s, indent) {
    if (!s) return ''
    if (stack[s.id]) {
      stack[s.id] = false
      return '  '.repeat(indent) + s.id + ' *\n' // circle?
    }
    stack[s.id] = true

    if (s.type === 'n') {
      const str = '  '.repeat(indent) + s.id + ' [' + s.symbol + '] ->\n' + (
        printState(s.out, indent + 1) +
        printState(s.out1, indent + 1)
      ) + '\n'
      stack[s.id] = false
      return str
    }
    if (s.type === 'e') {
      if (s.out1) {
        const str = '  '.repeat(indent) + s.id + ' (e) ->\n' + (
          printState(s.out, indent + 1) +
          printState(s.out1, indent + 1)
        ) + '\n'
        stack[s.id] = false
        return str
      }
      const str = printState(s.out, indent)
      stack[s.id] = false
      return str
    }
    const str = '  '.repeat(indent) + 'end'
    stack[s.id] = false
    return str
  }
}

describe('simulate nfa', function() {
  it('should match string with nfa', function() {
    const nfa = regex2nfa('(a|b)c')
    
    assert(match(nfa, 'ac') === true, 'ac')
    assert(match(nfa, 'bc') === true, 'bc')
    assert(match(nfa, 'abc') === false, 'abc')
    assert(match(nfa, 'c') === false, 'c')
  })
})
