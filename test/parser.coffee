assert = require('assert')
fs = require('fs')

{parser} = require('../build/haml-jr')

describe 'Parser', ->
  it 'should exist', ->
    assert(parser)

  it 'should parse some stuff', ->
    assert parser.parse("%yolo")

  describe 'samples', ->
    sampleDir = "test/samples/haml"

    fs.readdirSync(sampleDir).forEach (file) ->
      data = fs.readFileSync "#{sampleDir}/#{file}", "UTF-8"

      it "should parse #{file}", ->
        assert parser.parse(data)
