const assert = require('assert')
const NFA = require('../lib/nfa')
const DFA = require('../lib/dfa')

describe('DFA', () => {
  it('createFromNFA()', () => {

    assert_equal_regexp_with_dfa('ab',  {
      start: '0',
      end: [ '3' ],
      inputs: [ 'a', 'b' ],
      states: [ '0', '1', '3' ],
      transitions:
      [ { from: '0', to: '1', input: 'a' },
        { from: '1', to: '3', input: 'b' } ]
    })

    assert_equal_regexp_with_dfa('a|b',  {
      start: '0-2-4',
      end: [ '1-5', '3-5' ],
      inputs: [ 'a', 'b' ],
      states: [ '0-2-4', '1-5', '3-5' ],
      transitions:
      [ { from: '0-2-4', to: '1-5', input: 'a' },
        { from: '0-2-4', to: '3-5', input: 'b' } ]
    })

    function assert_equal_regexp_with_dfa(regexp, expect) {
      assert.deepEqual(DFA.createFromNFA(NFA.createFromRegexp(regexp)), expect, 'regexp: ' + regexp)
    }
  })
})