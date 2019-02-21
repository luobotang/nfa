(function() {
  const { NFA, DFA } = window.lib
  const {NETWORK_OPTIONS, render_nfa_to_network_data, render_dfa_to_network_data} = window.renderer

  new Vue({
    el: '#root',
    data: {
      regexp: '(a+|b)c(d|e)',
      set_list: [],
      transition_list: [],
      running: false,
      dfa_generated: false,
      dfa_visible: false
    },
    mounted() {
      const nfa = this.nfa = NFA.createFromRegexp(this.regexp)
      const data_nfa = render_nfa_to_network_data(nfa)
      this.network_nfa = new vis.Network(this.$refs.canvas, data_nfa, NETWORK_OPTIONS)
    },
    methods: {
      start() {
        if (this.running) return
        this.running = true
        this.dfa_generated = false

        DFA.createFromNFA_step(this.nfa, ({finished, next, data}) => {
          this.nextStep = next
          if (finished) {
            this.stop()
            this.done(data)
            return
          }
          this.update(data)
        })
      },
      stop() {
        this.running = false
      },
      next() {
        this.nextStep()
      },
      update({inputs, visited, set, transitions}) {
        const set_list = []
        set.forEach(id => {
          set_list.push({
            id,
            visited: visited.has(id)
          })
        })
        this.set_list = set_list

        this.transition_list = transitions

        // todo
      },
      done(dfa) {
        this.dfa_generated = true
        this.dfa = dfa
        const data_nfa = render_dfa_to_network_data(dfa)
        if (!this.network_dfa) {
          this.network_dfa = new vis.Network(this.$refs.dfa, data_nfa, NETWORK_OPTIONS)
        } else {
          this.network_dfa.setData(data_nfa)
        }
        this.dfa_visible = true
      }
    }
  })
})()