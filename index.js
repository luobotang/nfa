const { regex2post, NFA } = require('./lib/nfa')
const { match } = require('./lib/simulator')

module.exports = {
  regex2post,
  match,
  NFA
}