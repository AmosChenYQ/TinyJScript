
// E -> E + T  | E - T | T
// E -> TE'
// E' -> +E | -E | e

// T -> (E) | T * L | T / L
// T -> LT' | (E)
// T' -> *T | /T | e

1 + 2 * 3
function parseE(tokens, index = 0) {
    const term = parseT(tokens, index)
    const expr = parseEPlus(tokens, index + ?)
    return {
        left: term,
        ...expr
    }
}

function parseEPlus(tokens, index) {
    const token = tokens[index]
    if(token && (token.value === "+" || token.value === "-")) {
        const expr = parseE(tokens, index + 1)
        return {
            op: token.value,
            right: expr
        }
    }
    return null
}

function parseT(tokens, index) {
    const token = tokens[index]
    if(token.value === "(") {
        return parseE(tokens, index + 1)        
    } else {
        const literal = parseL(tokens, index++)
        const term = parseTPlus(tokens, index)
        return {
            left: literal,
            ...term
        }
    }
}

function parseTPlus(tokens, index) {
    const token = tokens[index]
    if(token && (token.value === "*" || token.value === "/")) {
        const term = parseT(tokens, index + 1)
        return {
            op: token.value,
            right: term
        }
    }
    return null
}

function parseL(tokens, index) {
    const token = tokens[index]
    if(token.type === "id") {
        return {
            type: "id",
            id: token.value
        }
    } else if(token.type === "number") {
        return {
            type: "number",
            id: token.value
        }
    } else {
        throw 'syntax error'
    }
}

