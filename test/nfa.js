const assert = require('assert')
const { regex2post, NFA } = require('../')

describe('nfa', function() {
  it('regex2post()', function() {
    assert_regex_with_post('ab', 'ab.')
    assert_regex_with_post('a|b', 'ab|')
    assert_regex_with_post('a|b|c', 'ab|c|')
    assert_regex_with_post('a*b', 'a*b.')
    assert_regex_with_post('a?b', 'a?b.')
    assert_regex_with_post('a+b', 'a+b.')
    assert_regex_with_post('ab+|cd', 'ab+.cd.|')
    assert_regex_with_post('(a|b)c', 'ab|c.')
    assert_regex_with_post('abc', 'ab.c.')
    assert_regex_with_post('(a|b)(c|d)', 'ab|cd|.')
    assert_regex_with_post('ab?', 'ab?.')
    assert_regex_with_post('(a|b)c?', 'ab|c?.')
    assert_regex_with_post('(a+|b)c', 'a+b|c.')
    assert_regex_with_post('a(bc)+', 'abc.+.')

    function assert_regex_with_post(regex, expect) {
      const result = regex2post(regex)
      assert.equal(result, expect, `regexp "${regex}"`)
    }
  })

  it('createFromPostfixExpression()', () => {
    assert_post_with_nfa('a', {
      start: 0,
      end: 1,
      state_map: [[0, {id: 0, transitions: [0]}], [1, {id: 1, transitions: []}]],
      transition_map: [[0, {id: 0, from: 0, to: 1, input: 'a'}]]
    })

    assert_post_with_nfa('ab|', {
      start: 4,
      end: 5,
      state_map: [
        [0, {id: 0, transitions: [0]}],
        [1, {id: 1, transitions: [4]}],
        [2, {id: 2, transitions: [1]}],
        [3, {id: 3, transitions: [5]}],
        [4, {id: 4, transitions: [2,3]}],
        [5, {id: 5, transitions: []}],
      ],
      transition_map: [
        [0, {id: 0, from: 0, to: 1, input: 'a'}],
        [1, {id: 1, from: 2, to: 3, input: 'b'}],
        [2, {id: 2, from: 4, to: 0, input: ''}],
        [3, {id: 3, from: 4, to: 2, input: ''}],
        [4, {id: 4, from: 1, to: 5, input: ''}],
        [5, {id: 5, from: 3, to: 5, input: ''}],
      ]
    })

    assert_post_with_nfa('ab.', {
      start: 0,
      end: 3,
      state_map: [
        [0, {id: 0, transitions: [0]}],
        [1, {id: 1, transitions: [1]}],
        [3, {id: 3, transitions: []}]
      ],
      transition_map: [
        [0, {id: 0, from: 0, to: 1, input: 'a'}],
        [1, {id: 1, from: 1, to: 3, input: 'b'}]
      ]
    })

    assert_post_with_nfa('a*', {
      start: 2,
      end: 3,
      /**
       * 0 -> 1
       * 2 -> 0
       * 2 -> 3
       * 1 -> 0
       * 1 -> 3
       */
      state_map: [
        [0, {id: 0, transitions: [0]}],
        [1, {id: 1, transitions: [3,4]}],
        [2, {id: 2, transitions: [1,2]}],
        [3, {id: 3, transitions: []}]
      ],
      transition_map: [
        [0, {id: 0, from: 0, to: 1, input: 'a'}],
        [1, {id: 1, from: 2, to: 0, input: ''}],
        [2, {id: 2, from: 2, to: 3, input: ''}],
        [3, {id: 3, from: 1, to: 0, input: ''}],
        [4, {id: 4, from: 1, to: 3, input: ''}]
      ]
    })

    assert_post_with_nfa('a?', {
      start: 2,
      end: 3,
      /**
       * 0 -> 1
       * 2 -> 0
       * 2 -> 3
       * 1 -> 3
       */
      state_map: [
        [0, {id: 0, transitions: [0]}],
        [1, {id: 1, transitions: [3]}],
        [2, {id: 2, transitions: [1,2]}],
        [3, {id: 3, transitions: []}]
      ],
      transition_map: [
        [0, {id: 0, from: 0, to: 1, input: 'a'}],
        [1, {id: 1, from: 2, to: 0, input: ''}],
        [2, {id: 2, from: 2, to: 3, input: ''}],
        [3, {id: 3, from: 1, to: 3, input: ''}]
      ]
    })

    assert_post_with_nfa('a+', {
      start: 2,
      end: 3,
      /**
       * 0 -> 1
       * 2 -> 0
       * 1 -> 0
       * 1 -> 3
       */
      state_map: [
        [0, {id: 0, transitions: [0]}],
        [1, {id: 1, transitions: [2,3]}],
        [2, {id: 2, transitions: [1]}],
        [3, {id: 3, transitions: []}]
      ],
      transition_map: [
        [0, {id: 0, from: 0, to: 1, input: 'a'}],
        [1, {id: 1, from: 2, to: 0, input: ''}],
        [2, {id: 2, from: 1, to: 0, input: ''}],
        [3, {id: 3, from: 1, to: 3, input: ''}]
      ]
    })

    function assert_post_with_nfa(post, nfa_def) {
      const nfa = NFA.createFromPostfixExpression(post)
      assert.equal(JSON.stringify(nfa), JSON.stringify(nfa_def), post)
    }
  })
})
