const { LexicalError, makeToken } = require('./util') 

function number(sourceCode, index, linenumber) {
	let state = 0
	let number = ""
	while(true) {
		const c = sourceCode[index++]
		switch(state) {
			case 0: {
				if (c === '0') {
					number += c
					state = 2 
				} else if (c.match(/[1-9]/)) {
					number += c
					state = 1
				} else if (c === '.') {
					number += c
					state = 3
				} else {
					throw new LexicalError(`not a number ${c} in line ${linenumber}`)
				}
				break
			}
			case 1: {
				if (c.match(/[0-9]/)) {
					number += c
				} else if (c === '.') {
					number += c
					state = 4
				}else {
					return makeToken('number', number)
				}
				break
			}
			case 2: {
				if (c.match(/[1-9]/)) {
					number += c
					state = 1
				} else if (c === '.') {
					number += c
					state = 4
				} else {
					return makeToken('number', number)
				}
				break
			}
			case 3: {
				if (c.match(/[0-9]/)) {
					number += c
					state = 5
				} else {
					throw new LexicalError(`not a number ${c} in line ${linenumber}`)
				}
				break
			}
			case 4: {
				if(c.match(/[0-9]/)) {
					state = 5
					number += c
				} else {
					return makeToken('number', number.substring(0, number.length-1))
				}
				break
			}
			case 5: {
				if(c.match(/[0-9]/)) {
					number += c
				} else {
					return makeToken('number', number)
				}
				break
			}
		}
	}
}

module.exports = number