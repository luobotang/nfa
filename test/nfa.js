const assert = require('assert')
const { regex2post, post2nfa, travelState } = require('../')

describe('nfa', function() {
  it('regex2post()', function() {
    assert_regex_with_post('ab', 'ab.')
    assert_regex_with_post('a|b', 'ab|')
    assert_regex_with_post('a|b|c', 'ab|c|')
    assert_regex_with_post('a*b', 'a*b.')
    assert_regex_with_post('a?b', 'a?b.')
    assert_regex_with_post('a+b', 'a+b.')
    assert_regex_with_post('ab+|cd', 'ab+.cd.|')
    assert_regex_with_post('(a|b)c', 'ab|c.')
    assert_regex_with_post('abc', 'ab.c.')
    assert_regex_with_post('(a|b)(c|d)', 'ab|cd|.')
    assert_regex_with_post('ab?', 'ab?.')
    assert_regex_with_post('(a|b)c?', 'ab|c?.')
    assert_regex_with_post('(a+|b)c', 'a+b|c.')
    assert_regex_with_post('a(bc)+', 'abc.+.')

    function assert_regex_with_post(regex, expect) {
      const result = regex2post(regex)
      assert.equal(result, expect, `regexp "${regex}"`)
    }
  })

  it('post2nfa()', function() {

    assert_post_with_nfa('ab|c.', 5)
    assert_post_with_nfa('a+b.', 3)
    assert_post_with_nfa('a+b|c.', 5)
    assert_post_with_nfa('a*b|c.', 6)

    function assert_post_with_nfa(post, nfa_state_count) {
      const nfa = post2nfa(post)
      const result = count_nfa_state(nfa)
      if (result !== nfa_state_count) {
        throw new Error([
          `nfa state count expect: ${nfa_state_count}, result: ${result}`,
          `post: "${post}"`,
          'nfa:',
          printNfa(nfa)
        ].join('\n'))
      }
    }

    function count_nfa_state(nfa) {
      let n = 0
      travelState(nfa.start, () => n++)
      return n
    }
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