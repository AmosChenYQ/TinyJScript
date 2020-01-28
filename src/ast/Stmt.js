const LexicalScope = require('./LexicalScope')

class Stmt {
  buildLexicalScope(parent) {
    this.lexicalScope = parent
  }
}

