const { Expr } = require('./ast/Expr')

/**
 * operator code PRIORITY_TABLE
 */
const PRIORITY_TABLE = {
  '+' : 60,
  '-' : 60,
  '*' : 70,
  '/' : 70,
  '>=' : 80,
  '<=' : 80,
  '>' : 80,
  '<' : 80,
  '&&' : 90,
  '||' : 90,
  '==' : 100,
  '!=' : 100,
  '(' : 1000, // useless
  ')' : 1000,
}

/**
 * pop stack untill predicion is statified and callback for each pop out element
 * @param {list} stack 
 * @param {lambda} prediction 
 * @param {lambda} callback 
 */
function popUntil(stack, prediction, callback) {
  let v = null
  while( v = stack.pop() ) {
    if(prediction(v)) {
      stack.push(v)
      break
    }
    callback(v)
  }
}

/**
 * @param {class Parse} parser 
 */
function parseExpr(parser) {
  if(parser.lookahead.value === ')' || parser.lookahead.value === ',') {
    return null
  }
  const postOrderOutput = inOrderToPostOrder.call(parser) // function inOrderToPostOrder this is parser
  return constructAST(postOrderOutput)
}

function constructAST(postOrderOutput) {
  let c = null
  const stack = []
  for(let i = 0; i < postOrderOutput.length; i++) {
    const c = postOrderOutput[i]
    if(c.type === 'op') {
      const right = stack.pop()
      const left = stack.pop()
      const expr = new Expr(c.value, left, right)
      stack.push(expr)
    } else {
      stack.push(c)
    }
  }
  return stack[0]
}

function inOrderToPostOrder() {
  const opStack = []
  const output = []

  while(this.lookahead.value !== 'eof' && this.lookahead.value !== '}' && this.lookahead.value !== ',') {
    if(this.lookahead.value === '(') {
      opStack.push(this.lookahead)
      this.match('(')
    } else if(this.lookahead.value === ')') {
      popUntil(opStack, x => x.value === '(', x => { output.push(x) })
      const op = opStack.pop()
      if(!op || op.value !== '(') {
        break
      }
      this.match(')')
    } else if(this.lookahead.type === 'op') {
      const op = this.lookahead
      if(!(op.value in PRIORITY_TABLE)) {
        throw `An operator expected in @line ${this.lookahead.lineno} but ${this.lookahead.value} found`
      }
      this.match(op.value)
      const lastOp = opStack[opStack.length - 1]
      if(!lastOp) {
        opStack.push(op)
      } else {
        if(PRIORITY_TABLE[op.value] <= PRIORITY_TABLE[lastOp.value]) {
          popUntil(opStack, x => !x || x.value === '(' || PRIORITY_TABLE[x.value] < PRIORITY_TABLE[op.value], x => { output.push(x) })
        }
        opStack.push(op)
      }
    } else {
      const factor = this.parseFactor()
      output.push(factor)
      if(this.lookahead.type !== 'op' || this.lookahead.value === '=') {
        break
      }
    }
  }

  if(opStack.length > 0) {
    while(opStack.length > 0) {
      output.push(opStack.pop())
    }
  }

  return output
}

module.exports = parseExpr