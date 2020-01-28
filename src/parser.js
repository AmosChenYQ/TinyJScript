const lexer = require('./lexer')

const { Program, DeclareStmt, Function, Block, IfStmt, ReturnStmt } = require('./ast/Stmt')
const { Args, AssignExpr, FunctionCallExpr } = require('./ast/Expr')
const { Id, Numeral } = require('./ast/Terminal')
const exprParser = require('./exprParser')

class Parser {
  parse(sourceCode) {
    this.tokens = lexer(sourceCode)

    // add a guard to judge if we meet the end of a file
    this.tokens.push({ type: 'eof', value: null })
    this.index = 0
    this.lookahead = this.tokens[this.index++]

    const program = this.parseProgram()
    program.buildLexicalScope()
    return program

  }

  // eat a token and update lookahead
  read() {
    if (this.lookahead.type !== 'eof') {
      this.lookahead = this.tokens[this.index++]
    }
  }

  // eat a token if value is expected
  match(value) {
    if (this.lookahead.value === value) {
      this.read()
      return value
    }
    throw `syntax error @line ${this.lookahead.lineno} : expect ${value} here but ${this.lookahead.value} found`
  }

  // eat a token if type is expected
  matchType(type) {
    if (this.lookahead.type === type) {
      this.read()
    }
    throw `syntax error @line ${this.lookahead.lineno} : expect type ${type} here but ${this.lookahead.type} found`
  }

	/**
	 * Program -> Stmts
	 */
  parseProgram() {
    return new Program(this.parseStmts())
  }

	/**
	 * Stmts -> Stmt Stmts | e
	 */
  parseStmts() {
    const stmts = []
    while (this.lookahead.value !== "eof" && this.lookahead.value !== "}") {
      stmts.push(this.parseStmt())
    }
    return stmts
  }

	/**
	 * Stmt -> DeclareStmt | IfStmt | WhileStmt | Function | Block | ...
	 * DeclareStmt -> auto <id> = Expr
	 * IfStmt -> if Expr Block else IfStmt | if Expr Block | Stmt
	 */
  parseStmt() {
    if (this.lookahead.type === "id" || this.lookahead.type === "number") {
      return this.parseExpr()
    }

    switch (this.lookahead.value) {
      case 'auto':
        return this.parseDeclareStmt();
      case 'function':
        return this.parseFunctionStmt();
      case 'if':
        return this.parseIfStmt();
      case 'return':
        return this.parseReturnStmt()
      default:
        console.log(this.lookahead)
        throw `syntax error @line ${this.lookahead.lineno} : not impl. ${this.lookahead.value}`
    }
  }

  parseBlock() {
    this.match('{')
    const stmts = this.parseStmts()
    this.match('}')
    return new Block(stmts)
  }

	/**
	 * FunctionStmt -> function {id}(...ARGS) BLOCK
	 */
  parseFunctionStmt() {
    this.match('function')
    if (this.lookahead.type !== 'id') {
      throw 'syntax error'
    }
    const id = this.lookahead.value
    this.match(id)

    this.match('(')
    const args = this.parseFuncArguments()
    this.match(')')

    const block = this.parseBlock()
    return new Function(new Id(id), args, block)
  }

	/** 
	 * ReturnStmt -> return Expr
	*/
  parseReturnStmt() {
    this.match('return')
    const expr = this.parseExpr()
    return new ReturnStmt(expr)
  }

	/**
	 * Args -> <id> | <id>,Args | e
	 */
  parseFuncArguments() {
    let list = []
    if (this.lookahead.type === 'id') {
      const id = this.lookahead.value
      this.match(id)
      list.push(new Id(id))
      if (this.lookahead.value === ',') {
        this.match(',')
        list = list.concat(this.parseFuncArguments())
      } else {
        return []
      }
      return new Args(list, 'function')
    }
  }

	/**
	 * 
	 */
  parseArguments() {
    let list = []
    let expr = null
    while ((expr = this.parseExpr())) {
      list.push(expr)
    }
    return new Args(list)
  }

	/**
	 * IfStmt -> if Expr Block | if Expr Block else IfStmt | if Expr Block else Block
	 */
  parseIfStmt() {
    this.match('if')
    const expr = this.parseExpr()
    const ifBlock = this.parseBlock()

    if (this.lookahead.value === 'else') {
      this.match('else')

      if (this.lookahead.value === 'if') {
        const ifStmt = this.parseIfStmt()
        return new IfStmt(expr, ifBlock, ifStmt)
      } else {
        const elseBlock = this.parseBlock()
        return new IfStmt(expr, ifBlock, null, elseBlock)
      }
    } else {
      return new IfStmt(expr, ifBlock)
    }
  }

	/**
	 * DeclareStmt -> auto id = expr
	 */
  parseDeclareStmt() {
    this.match('auto')
    if (this.lookahead.type !== 'id') {
      throw `syntax error: not declare stmt`
    }
    const id = new Id(this.lookahead.value)

    this.match(this.lookahead.value)
    this.match('=')
    const right = this.parseExpr()
    return new DeclareStmt(id, right)
  }

  parseExpr() {
    return exprParser(this)
  }

	/**
	 * factor -> number | string | id
	 */
  parseFactor() {
    if (this.lookahead.type === 'number') {
      const value = this.match(this.lookahead.value)
      return new Numeral(value)
    } else if (this.lookahead.type === "id") {
      const value = this.match(this.lookahead.value)
      if (this.lookahead.value === '(') {
        this.match('(')
        const args = this.parseArguments()
        this.match(')')
        return new FunctionCallExpr(new Id(value), args)
      } else if (this.lookahead.value === '=') {
        this.match('=')
        const expr = this.parseExpr()
        return new AssignExpr(new Id(value), expr)
      }
      return new Id(value)
    } else if (this.lookahead.type === 'string') {
      throw 'not impl.'
    } else {
      throw `syntax error, expect a factor but ${this.lookahead.value} found`
    }
  }

}

module.exports = Parser