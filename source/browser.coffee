{parser} = require('./parser')
{lexer} = require('../build/lexer')
{renderJST} = require('./renderer')

parser.lexer = lexer


window.parser = parser
window.render = renderJST
