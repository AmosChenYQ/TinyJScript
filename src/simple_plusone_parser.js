// 1 + 1 + 1 + 1 + 1 + 1 -> ast   +
// E -> 1 E'                    1    + 
// E' -> + E                       1   1

// {
//     op: '+',
//     left: 1,
//     right: {
//         op: '+',
//         left: 1,
//         right: 1,
//     }
// }

function parseE(tokens) {
    const token = tokens.shift()

    if(token.type === 'number' && token.value === '1') {
        const ast = parseEPlus(tokens)
        return {
            left: 1,
            ...ast
        }
    } else {
        throw 'syntax error'
    }
}

function parseEPlus(tokens) {
    if(tokens.length === 0) { return null }
    const token = tokens.shift()
    if(token.value === '+') {
        const ast = parseE(tokens)
        return {
            op: "+",
            right: ast
        }
    }
}

// {
//     op: '+'

// }

// parseEPlus([{type: 'op', value: '+'}, {type: 'number', value: '1'}]) 
// {
//     op: '+',
//     right: 1
// }
// parseE([{type: 'number', value: '1'}])
// {
//     left: 1,
// }
// [{type: 'number', value: '1'}, {type: 'op', value: '+'}, {type: 'number', value: '1'}, {type: 'op', value: '+'}, {type: 'number', value: '1'}, {type: 'op', value: '+'}, {type: 'number', value: '1'}, {type: 'op', value: '+'}, {type: 'number', value: '1'}]