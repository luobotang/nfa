const assert = require('assert')
const { regex2nfa } = require('../lib/nfa')
const { match } = require('../lib/simulator')

describe('simulator', function() {
  it('match()', function() {

    assert_match('(a|b)c', [
      ['ac', true],
      ['bc', true],
      ['abc', false],
      ['c', false]
    ])
    assert_match('a+b|c', [
      ['ab', true],
      ['ac', false],
      ['b', false],
      ['aab', true],
      ['aaaaaab', true],
      ['c', true]
    ])
    assert_match('a?bc', [
      ['abc', true],
      ['bc', true],
      ['ab', false],
      ['ac', false]
    ])

    function assert_match(regexp, cases) {
      const nfa = regex2nfa(regexp)
      cases.forEach(([str, expected]) => {
        assert.equal(match(nfa, str), expected, `use "${regexp}" match "${str}"`)
      })
    }
  })
})