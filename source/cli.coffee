fs = require('fs')
{jsdom} = require("jsdom")
{parser, compile} = HAMLjr = require('./haml-jr')

file = process.argv[2]

document = jsdom()

runFile = (name) ->
  data = fs.readFileSync name, "UTF-8"
  ast = parser.parse(data)

  program = compile ast,
    explicitScripts: true

  # console.log program

  fn = eval(program)

  fragment = fn()

  output = Array.prototype.map.call fragment.childNodes, (node) ->
    node.outerHTML
  .join("\n")

  process.stdout.write output

runFile(file)
