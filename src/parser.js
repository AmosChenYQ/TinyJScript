const lexer = require('./lexer')

// const { Program, DeclareStmt, Function, Block, IfStmt, ReturnStmt } = require('./ast/Stmt')
// const { Args, AssignExpr, FunctionCallExpr } = require('./ast/Expr')
// const { Id, Numeral } = require('./ast/Terminal')
// const exprParser = require('./exprParser')

class Parser {
    parse(sourceCode) {
        this.tokens = lexer(sourceCode)

        this.tokens.push({type: 'eof', value: null})
        this.index = 0
        this.lookahead = this.tokens[this.index++]

        console.log(this.tokens)
        console.log(this.index)
        console.log(this.lookahead)

    }
}

module.exports = Parser