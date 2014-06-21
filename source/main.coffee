{compile} = require "./compiler"
parser = require "hamlet-parser"
CoffeeScript = require "coffee-script"

module.exports =
  compile: (input, options={}) ->
    if typeof input is "string"
      input = parser.parse(input)

    options.compiler ?= CoffeeScript

    return compile(input, options)

  parser: parser
