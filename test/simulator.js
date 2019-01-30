const assert = require('assert')
const NFA = require('../lib/nfa')
const { run, runWithBacktrack } = require('../lib/simulator')

describe('simulator', function() {
  const match_cases = [
    [
      'a',
      ['a', true],
      ['b', false],
      ['', false],
      ['aa', false]
    ],
    [
      'ab',
      ['ab', true],
      ['a', false],
      ['b', false],
      ['ac', false],
      ['abc', false]
    ],
    [
      'a|b',
      ['a', true],
      ['b', true],
      ['c', false],
      ['ab', false],
      ['', false]
    ],
    [
      '(a|b)c',
      ['ac', true],
      ['bc', true],
      ['abc', false],
      ['c', false]
    ],
    [
      'a+b|c',
      ['ab', true],
      ['ac', false],
      ['b', false],
      ['aab', true],
      ['aaaaaab', true],
      ['c', true]
    ],
    [
      'a?bc',
      ['abc', true],
      ['bc', true],
      ['ab', false],
      ['ac', false]
    ]
  ]
  it('run()', () => {
    match_cases.forEach((def) => {
      const regex = def[0]
      const nfa = NFA.createFromRegexp(regex)
      for (let i = 1, len = def.length; i < len; i++) {
        let [str, expected] = def[i]
        assert.equal(run(nfa, str), expected, `run "${regex}" on "${str}"`)
      }
    })
  })
  it('runWithBacktrack()', () => {
    match_cases.forEach((def) => {
      const regex = def[0]
      const nfa = NFA.createFromRegexp(regex)
      for (let i = 1, len = def.length; i < len; i++) {
        let [str, expected] = def[i]
        assert.equal(runWithBacktrack(nfa, str), expected, `runWithBacktrack "${regex}" on "${str}"`)
      }
    })
  })
})