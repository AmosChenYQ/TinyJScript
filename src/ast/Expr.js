class Expr {
  constructor(op, left, right) {
    this.op = op
    this.left = left
    this.right = right
  }

  print(level=0){
    const pad = ''.padStart(level * 2)
    console.log(pad + this.op)
    this.left && this.left.print(level + 1)
    this.right && this.right.print(level + 1)
  }

  gen(il, scope) {
    this.left && this.left.gen && this.left.gen(il, scope)
    this.right && this.right.gen && this.right.gen(il, scope)
    const tempVar = scope.bindTempVar()
    il.add(`set ${tempVar} ${this.left.rvalue()} ${this.op} ${this.right.rvalue()}`)
    this._rval = tempVar
  }

  rvalue(){
    return this._rval
  }

  
}