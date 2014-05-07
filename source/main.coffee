{compile} = require "./compiler"
parser = require "hamlet-parser"

module.exports =
  compile: (input, options) ->
    if typeof input is "string"
      input = parser.parse(input)

    return compile(input, options)

  parser: parser
