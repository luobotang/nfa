const NFA = require('../lib/nfa')
const DFA = require('../lib/dfa')

describe('DFA', () => {
  it('createFromNFA()', () => {
    const nfa = NFA.createFromeRegex('ab')
    const dfa = DFA.createFromNFA(nfa)
    console.log(dfa)
  })
})