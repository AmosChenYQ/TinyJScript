const { makeToken, LexicalError, KEYWORDS } = require('./util')

function literal(sourceCode, index=0) {
	let state = 0
	let str = ''

	function getNextChar() {
		return sourceCode[index++]
	}
	
	while(true) {
		switch(state) {
			case 0: {
				const c = getNextChar()
				if (c.match(/[A-Za-z]/)) {
					state = 1
					str += c
				} else {
					throw new LexicalError(`not a illegal operator ${c} at ${index-1} in line ${linenumber}`)
				}
				break
			}
			case 1: {
				const c = getNextChar()
				if (c.match(/[A-Za-z0-9]/)) {
					state = 1
					str += c
				} else {
					if (KEYWORDS.includes(str)) {
						return makeToken('keyword', str)
					} else {
						return makeToken('id', str)
					}
				}
				break
			}
		}
	}
}

module.exports = literal