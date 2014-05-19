assert = require('assert')
fs = require('fs')

{parser, compile} = require('../source/main')

schwaza = (template, data) ->
  code = "return " + compile(template)

  fragment = Function("Runtime", code)(Runtime)(data)

  div = document.createElement("div")
  div.appendChild fragment

  return div

describe 'Compiler', ->
  describe 'parser', ->
    it 'should exist', ->
      assert(parser)

    it 'should parse some stuff', ->
      assert parser.parse("%yolo")

  describe 'samples', ->
    sampleDir = "test/samples/haml"

    fs.readdirSync(sampleDir).forEach (file) ->
      data = fs.readFileSync "#{sampleDir}/#{file}", "UTF-8"
      ast = null

      it "should parse #{file}", ->
        ast = parser.parse(data)
        assert ast

      it "should compile #{file}", ->
        assert compile(ast)

  describe 'compiler', ->
    describe 'keywords', ->
      it "should not replace `items.each` with `items.__each`", ->
        compiled = compile('- items.each ->')

        assert !compiled.match(/items.__each/)
