// const Symbols = require('../Symbols')
const LexicalScope = require('./LexicalScope')
const ILGen = require('../gen/ILGen')

class Stmt {
  buildLexicalScope(parent) {
    this.lexicalScope = parent
  }
}

class DeclareStmt extends Stmt {
  constructor(left, right, isCreate = false) {
    super()
    this.left = left
    this.right = right
    this.isCreate = isCreate
  }

  buildLexicalScope(parent) {
    this.lexicalScope = parent
    this.lexicalScope.bind(this.left.value, 'number')
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + '=')
    this.left && this.left.print(level + 1)
    this.right && this.right.print(level + 1)
  }

  gen(il, scope) {
    if(this.right.gen) {
      this.right.gen(il, this.lexicalScope)
    }
    il.add(`declare ${this.lexicalScope.getLexemeName(this.left.value)}`)
    this.right.rvalue() && il.add(`set ${this.lexicalScope.getLexemeName(this.left.value)} ${this.right.rvalue()}`)
  }
}

class Block {
  constructor(stmts) {
    this.stmts = stmts
  }

  buildLexicalScope(parent, create = true) {
    if(create) {
      this.lexicalScope = new LexicalScope(parent)
    } else {
      this.lexicalScope = parent
    }

    this.stmts.forEach(stmt => {
      if(stmt instanceof Stmt) {
        stmt.buildLexicalScope(this.lexicalScope)
      } else {
        stmt.bindLexicalScope(this.lexicalScope)
      }
    })
  }

  print() {
    for(let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].print(0)
    }
  }

  gen(il) {
    for(let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].gen(il, this.lexicalScope)
    }
  }
}

class Program extends Block {
  constructor(stmts) {
    super(stmts)
    this.ilGen = new ILGen()
  }

  registerGlobals(scope) {
    scope.bind('print', 'function')
  }

  buildLexicalScope() {
    this.lexicalScope = new LexicalScope()
    this.registerGlobals(this.lexicalScope)
    this.stmts.forEach(stmt => {
      if(stmt instanceof Stmt) {
        stmt.buildLexicalScope(this.lexicalScope)
      } else {
        stmt.bindLexicalScope(this.lexicalScope)
      }
    })
  }

  gen() {
    this.ilGen.beginSection('main@1')
    this.ilGen.add('set %TOP% %SP%')
    for(let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].gen(this.ilGen, this.lexicalScope)
    }
    this.ilGen.endSection()
  }
}

class IfStmt extends Stmt {
  /**
   * 
   * @param {*} expr expression after if keyword
   * @param {*} ifBlock block after if keyword
   * @param {*} elseIfStmt else if after whole if block
   * @param {*} elseBlock else block after whole if block
   */
  constructor(expr, ifBlock, elseIfStmt, elseBlock) {
    super()
    this.expr = expr
    this.ifBlock = ifBlock
    this.elseIfStmt = elseIfStmt
    this.elseBlock = elseBlock
  }

  buildLexicalScope(parent) {
    super.buildLexicalScope(parent)
    this.expr.bindLexicalScope(this.lexicalScope)
    this.ifBlock.buildLexicalScope(this.lexicalScope)
    this.elseIfStmt && this.elseIfStmt.buildLexicalScope(this.lexicalScope)
    this.elseBlock && this.elseBlock.buildLexicalScope(this.lexicalScope)
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + 'if')
    this.expr.print(level + 1)
    this.ifBlock.print(level + 1)
  }

  gen(il) {
    this.expr.gen(il, this.lexicalScope)
    const ifCodeLine = il.add('', true)
    let ifBlockNextLineNo = null
    this.ifBlock.gen(il, this.lexicalScope)

    if(this.elseIfStmt) {
      if(!ifBlockNextLineNo) {
        ifBlockNextLineNo = il.current().lineno
      }
      this.elseIfStmt.gen(il, this.lexicalScope)
    } else if(this.elseBlock) {
      if(!ifBlockNextLineNo){
        ifBlockNextLineNo = il.current().lineno
      }
      this.elseBlock.gen(il,this.lexicalScope)
    }

    const currentLine = il.currentLine()
    const l1 = il.genLabel()
    il.bindLabel(currentLine.lineno+1, l1)

    ifCodeLine.code = `branch ${this.expr.rvalue()} ${l1}`
  }
}

class ReturnStmt extends Stmt{
  constructor(expr){
    super()
    this.expr = expr
  }

  buildLexicalScope(parent) {
    super.buildLexicalScope(parent)
    this.expr.bindLexicalScope(this.lexicalScope)
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + 'return' )
    this.expr.print(level+1)
  }

  gen(il){
    this.expr && this.expr.gen && this.expr.gen(il,this.lexicalScope)
    il.add(`return ${this.lexicalScope.getLexemeName(this.expr.rvalue())}`)
  }
}

class Function extends Stmt{
  constructor(id, args, block) {
    super()
    this.id = id
    this.args = args
    this.block = block
  }

  buildLexicalScope(parent) {
    this.lexicalScope = new LexicalScope(parent, {
      type :'function',
      argc :this.args.size()
    })   
    parent.bind(this.id.value, 'function')
    if(this.args.size() > 0) {
      this.args.bindLexicalScope(this.lexicalScope)
    }
    this.block.buildLexicalScope(this.lexicalScope, false)
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + 'function:' + this.id.lvalue())
    this.args.length && this.args.print(level+1)
    this.block.print(level + 1)
  }

  gen(il) {
    il.add(`declare function ${this.lexicalScope.getLexemeName(this.id.lvalue())}`)
    il.beginSection(this.id.value+'@' + this.lexicalScope.id)
    il.add(`set %TOP% %SP%`)
    this.args.length && this.args.gen(il, this.lexicalScope)
    this.block.gen(il, this.lexicalScope)
    il.endSection()
  }
}

module.exports = {
  DeclareStmt,
  Program,
  Block,
  Function,
  IfStmt,
  ReturnStmt
}