const NFA = require('./lib/nfa')
const DFA = require('./lib/dfa')
const regex2post = require('./lib/regex2post')
const simulator = require('./lib/simulator')

module.exports = {
  NFA,
  DFA,
  regex2post,
  simulator
}