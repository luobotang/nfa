exports.match = function (nfa, str) {
  let c_list = []
  let n_list = []

  addState(c_list, nfa.start)

  for (let ch, i = 0, len = str.length; i < len; i++) {
    ch = str[i]
    step(ch)
    let t = c_list
    c_list = n_list
    n_list = t
  }

  function step(ch) {
    n_list.length = 0
    for (let i = 0, len = c_list.length; i < len; i++) {
      let s = c_list[i]
      if (s.symbol === ch) {
        addState(n_list, s.out)
        addState(n_list, s.out1)
      }
    }
  }

  function addState(list, s) {
    if (!s || list.indexOf(s) > -1) {
      return
    }
    if (s.type === 'e') {
      addState(list, s.out)
      addState(list, s.out1)
      return
    }
    list.push(s)
  }

  return c_list.findIndex((s) => {
    while (s && s.type === 'e') {
      s = s.out
    }
    return s && s.type === 'end'
  }) > -1
}
