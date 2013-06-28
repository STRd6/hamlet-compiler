assert = require('assert')
fs = require('fs')

{parser} = require('../haml.coffee')
{lexer} = require('../build/lexer')

parser.lexer = lexer

suite 'Parser', ->
  test 'should exist', ->
    assert(parser)

  test 'should parse some stuff', ->
    assert parser.parse("%yolo")

  suite 'samples', ->
    sampleDir = "test/samples/haml"

    fs.readdirSync(sampleDir).forEach (file) ->
      data = fs.readFileSync "#{sampleDir}/#{file}", "UTF-8"

      test "should parse #{file}", ->
        assert parser.parse(data)
