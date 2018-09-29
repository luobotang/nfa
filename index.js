const State = require('./lib/state')
const { regex2post, post2nfa, regex2nfa } = require('./lib/nfa')
const { match } = require('./lib/simulator')

module.exports = {
  travelState(state, callback) {
    State.travel(state, callback)
  },
  regex2post,
  post2nfa,
  regex2nfa,
  match
}