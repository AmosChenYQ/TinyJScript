class Factor {
  constructor(value) {
    this.value = value
  }

  lvalue() {
    return this.value
  }

  rvalue() {
    return this.value
  }

  print(level) {
    console.log(''.padStart(level * 2) + this.value)
  }
}

class Id extends Factor {
  bindLexicalScope(scope) {
    this.scope = scope.lookup(this.value)
    if (this.scope === null) {
      throw `syntax error: ${this.value} is not defined`
    }
  }

  lvalue() {
    return this.value
  }

  rvalue(scope) {  
    if(scope) {
      console.log("********************")
      console.log(scope.table)
      console.log(this.value)
      var _rvalue = `$t${scope.table[this.value].index}@${scope.id}`
      return _rvalue
    }
    return this.value
  }
}

class Numeral extends Factor { }

module.exports = {
  Id,
  Numeral
}