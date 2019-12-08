const { makeToken, LexicalError, KEYWORDS } = require('./util')

function literal(sourceCode, index) {
	let state = 0
	let str = ''

	function getNextChar() {
		return sourceCode[index++]
	}
	
	while(true) {
		switch(state) {
			case 0: {
				const c = getNextChar()
				if (/[A-Za-z]/.match(c)) {
					state = 1
					str += c
				} else {
					throw new LexicalError(`not a illegal operator ${c} at pos ${index-1}`)
				}
				break
			}
			case 1: {
				const c = getNextChar()
				if (/[A-Za-z0-9]/.match(c)) {
					state = 1
					str += c
				} else {
					if (KEYWORDS.include(str)) {
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