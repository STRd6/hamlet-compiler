{parser} = require('./parser')
{lexer} = require('../build/lexer')
{renderJST} = require('./renderer')

parser.lexer = lexer

exports.parser = parser
exports.render = renderJST
