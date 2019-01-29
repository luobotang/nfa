const NFA = require('../lib/nfa')
const DFA = require('../lib/dfa')

describe('DFA', () => {
  it('createFromNFA()', () => {
    const nfa = NFA.createFromeRegex('a|b|c')
    const dfa = DFA.createFromNFA(nfa)
    console.log(dfa)
  })
})