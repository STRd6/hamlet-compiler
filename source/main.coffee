{compile} = require "./compiler"
parser = require "hamlet-parser"
respace = require "./respace"

module.exports =
  compile: (input, options={}) ->
    if typeof input is "string"
      input = parser.parse(respace(input))

    return compile(input, options)

  parser: parser
