function makeToken(type, value, lineno) {
	return { type, value, lineno }
}

class LexicalError extends Error {
	constructor(msg) {
		super(msg)
	}
}

const KEYWORDS = [
	'if',
    'else',
    'while',
    'for',
    'break',
    'continue',
	'function',
    'auto',
    'return'
]

module.exports = {
    makeToken,
    LexicalError,
    KEYWORDS
}