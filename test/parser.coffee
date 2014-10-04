assert = require('assert')
fs = require('fs')
CoffeeScript = require "coffee-script"

{parser} = HamletCompiler = require('../source/main')

compile = (source, opts={}) ->
  opts.compiler ?= CoffeeScript

  HamletCompiler.compile source, opts

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
        data = compile(ast)
        assert data

  describe "exports", ->
    it "should default to module.exports", ->
      compiled = compile "%h1"

      assert compiled.match(/^module\.exports/)

    it "should be removable by passing false", ->
      compiled = compile "%h1", exports: false

      assert compiled.match(/^\(function\(data\) \{/)
