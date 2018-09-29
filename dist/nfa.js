/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

class State {
  constructor(type) {
    this.id = ++State.uid
    this.type = type || 'n' // 'n' - normal | 'e' - epsilon | 'end'
    this.symbol = ''
    this.out = null
    this.out1 = null
  }
}

State.uid = 0

State.travel = function(startState, callback) {
  const processed = {}

  travel(startState)

  function travel(state) {
    if (!state || processed[state.id]) return
    callback(state)
    processed[state.id] = true // must mark processed later, callback may change state.id!
    travel(state.out)
    travel(state.out1)
  }
}

module.exports = State

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const State = __webpack_require__(0)
const { regex2post, post2nfa, regex2nfa } = __webpack_require__(2)
const { match } = __webpack_require__(4)

module.exports = {
  travelState(state, callback) {
    State.travel(state, callback)
  },
  regex2post,
  post2nfa,
  regex2nfa,
  match
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const State = __webpack_require__(0)
const Fragment = __webpack_require__(3)

function regex2post(str) {
  const ex_stack = []
  const op_stack = []

  for (let ch, i = 0, len = str.length; i < len; i++) {
    ch = str[i]
    switch(ch) {
      case '|':
        check_op()
        op_stack.push('|')
        ex_stack.push('')
        break
      case '*':
      case '?':
      case '+':
        {
          const e = ex_stack.pop()
          ex_stack.push(e + ch)
        }
        break
      case '(':
        {
          ex_stack.push('')
        }
        break
      case ')':
        check_op()
        break
      default:
        {
          const e = ex_stack.pop()
          if (e) {
            ex_stack.push(e + ch + '.')
          } else {
            ex_stack.push(ch)
          }
        }
        break
    }
  }

  function check_op() {
    op = op_stack.pop()
    if (op) { // |
      const e2 = ex_stack.pop()
      const e1 = ex_stack.pop()
      ex_stack.push(e1 + e2 + op) // [...,'a', 'b'] -> [..., 'ab|']
    } else if (ex_stack.length === 2) { // need union
      const e2 = ex_stack.pop()
      const e1 = ex_stack.pop()
      ex_stack.push(e1 + e2 + '.')
    }
  }

  check_op()

  return ex_stack.join('')
}

function post2nfa(str) {
  const stack = []

  State.uid = 0 // reset

  for (let ch, i = 0, len = str.length; i < len; i++) {
    ch = str[i]
    switch(ch) {
      case '|':
        {
          const e2 = stack.pop()
          const e1 = stack.pop()
          const s = new State('e')
          const o = new State('e')
          s.out = e1.start
          s.out1 = e2.start
          e1.out.out = o
          e2.out.out = o
          stack.push(new Fragment(s, o))
        }
        break
      case '.':
        {
          const e2 = stack.pop()
          const e1 = stack.pop()
          e1.out.out = e2.start
          const o = new State('e')
          e2.out.out = o
          stack.push(new Fragment(e1.start, o))
        }
        break
      case '*':
        {
          const e = stack.pop()
          const s = new State('e')
          s.out = e.start
          e.out.out = s
          const o = new State('e')
          s.out1 = o
          stack.push(new Fragment(s, o))
        }
        break;
      case '?':
        {
          const e = stack.pop()
          const s = new State('e')
          s.out = e.start
          const o = new State('e')
          s.out1 = e.out.out = o
          stack.push(new Fragment(s, o))
        }
        break
      case '+':
        {
          const e = stack.pop()
          const s = new State('e')
          s.out = e.start
          e.out.out = s
          const o = new State('e')
          s.out1 = o
          stack.push(new Fragment(e.start, o))
        }
        break
      default:
        {
          const s = new State()
          s.symbol = ch
          const o = new State('e')
          s.out = o
          stack.push(new Fragment(s, o))
        }
        break
    }
  }

  const e = stack.pop()
  const o = new State('end')
  e.out.out = o

  let uid = 0
  let endState
  // - try remove useless epsilon state
  // - reset state uid
  State.travel(e.start, (s) => {
    if (s.type === 'end') {
      endState = s
      return
    }
    s.id = 10000 + (++uid) // NOTE! give a very big base number, so not same with current state id!
    while (tryRemoveEpsilonState(s)) {}
  })

  endState.id = 10000 + (++uid) // make sure the end state have the max id

  // remove the big base number
  State.travel(e.start, (s) => {
    s.id -= 10000
  })

  return e
}

function tryRemoveEpsilonState(s) {
  const next = s.out
  const next1 = s.out1
  // remove epsilon state
  if (next && next.type === 'e') {
    // s => {out: {type: 'e', ..}}
    if (!next1) {
      s.out = next.out
      s.out1 = next.out1
      return true
    }
    // s => {out: {type: 'e', out: {..}}, out1: {..}}
    if (!next.out1) {
      s.out = next.out
      return true
    }
  }
  // s => {out: {..}, out1: {type: 'e', out: {..}}}
  if (next1 && next1.type === 'e' && !next1.out1) {
    s.out1 = next1.out
    return true
  }
  return false
}

exports.regex2post = regex2post

exports.post2nfa = post2nfa

exports.regex2nfa = function(str) {
  return post2nfa(regex2post(str))
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = class Fragment {
  constructor(start, out) {
    this.start = start
    this.out = out
  }
}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

let uid = 0

exports.match = function (nfa, str) {
  let c_list = []
  let n_list = []
  const listid = ++uid

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
      }
    }
  }

  function addState(list, s) {
    if (!s || s.lastlist === listid) {
      return
    }
    s.lastlist = listid
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


/***/ })
/******/ ]);