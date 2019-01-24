const benchmark = require('benchmark')
const { NFA, simulator } = require('../')

runCase('a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z', ['a', 'z', '0'])

function runCase(regex, str_list) {
  const nfa = NFA.createFromeRegex(regex)

  console.log(regex)
  const suite = new benchmark.Suite()

  str_list.forEach((str) => {
    suite.add('run() ' + str, () => {
      simulator.run(nfa, str)
    })
    suite.add('runWithBacktrack() ' + str, () => {
      simulator.runWithBacktrack(nfa, str)
    })
  })
    
  suite.on('cycle', (e) => {
      console.log(e.target.toString())
    })
    .on('complete', () => {
      console.log('')
    })
    .run()
}
