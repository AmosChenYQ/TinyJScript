const { makeToken, LexicalError } = require('./lexical/util')
/**
 * 
 * @param {*} sourceCode
 * @return [Token] {type, value} 
 */

function lexer(sourceCode) {
	
	const tokens = []
	let i = 0
	let lineno = 0

	//
	function wrapper(automation_func) {
		return (...args) => {
			const token = automation_func(...args)
			i += token.value.length
			token.lineno = lineno
			tokens.push(token)
		}
	}

	const getTokenLiteral = wrapper(literal)
	const getTokenNumber = wrapper(number)
	const getTokenOp = wrapper(op)

	while(i<sourceCode.length) {

		const c = sourceCode[i]
			if (c.match(/[A-Za-z]/)) {
				getTokenLiteral(souceCode, i)
			} else if (c.match(/[0-9.]/)) {
				getTokenNumber(sourceCode, i)
			} else if (c.match(/[+-\\*/&|=!;()]/)) {
				getTokenOp(sourceCode, i)
			}
			// case '0':
			// case '1':
			// case '2':
			// case '3':
			// case '4':
			// case '5':
			// case '6':
			// case '7':
			// case '8':
			// case '9': {
			// 	getTokenNumber(sourceCode, i)
			// 	break
			// }
			// case '=':
			// case '<':
			// case '>':
			// case '!': {
			// 	getTokenRelop(sourceCode, i)
			// 	break
			// }
			// case '*':
			// case '+':
			// case '-':
			// case '/': {
			// 	getTokenArithmaticOp(sourceCode, i)
			// 	break
			// }
			// case '\n':
			// case ' ': {
			// 	i++;
			// 	break;
			// }
			// default:
			// 	throw new LexicalError(`unexpected char ${c} at position ${i-1}`)
				

	}

}





// rel => relation
// op => operator
function relop(
	sourceCode,
	index,
) {
	let state = 0



	function getNextChar() {
		return sourceCode[index++]
	}

	while (true) {
		switch (state) {
			case 0: {
				const c = getNextChar()
				switch (c) {
					case '>':
						state = 1
						break
					case '<':
						state = 2
						break
					case '=':
						state = 3
						break
					case '!':
						state = 4
						break
					default:
						throw new LexicalError('not a rel op')

				}
				break
			}
			case 1: {
				const c = getNextChar()
				if (c === '=') {
					return makeToken('op', '>=')
				} else {
					return makeToken('op', '>')
				}
			}
			case 2: {
				const c = getNextChar()
				if (c === '=') {
					return makeToken('op', '<=')
				} else {
					return makeToken('op', '<')
				}
			}
			case 3: {
				const c = getNextChar()
				if (c === '=') {
					return makeToken('op', '==')
				} else {
					throw new LexicalError("expect a '='")
				}
			}
			case 4: {
				const c = getNextChar()
				if (c === '=') {
					return makeToken('op', '!=')
				} else {
					throw new LexicalError("expect a '='")
				}
			}
		}
		console.log(sourceCode[index-1], state)
	}
}