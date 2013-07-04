fs = require('fs')
{jsdom} = require("jsdom")
{parser} = require('./parser')
{lexer} = require('../build/lexer')
{renderJST, renderHaml} = require('./renderer')

parser.lexer = lexer

file = process.argv[2]

document = jsdom()

runFile = (name) ->
  data = fs.readFileSync name, "UTF-8"
  ast = parser.parse(data)

  program = renderJST(ast)

  fn = eval(program)

  fragment = fn()

  output = Array.prototype.map.call fragment.childNodes, (node) ->
    node.outerHTML
  .join("\n")

  process.stdout.write output

runFile(file)
