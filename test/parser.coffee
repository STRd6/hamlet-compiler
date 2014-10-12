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

compileDirectory = (directory, mode) ->
  fs.readdirSync(directory).forEach (file) ->
    data = fs.readFileSync "#{directory}/#{file}", "UTF-8"
    ast = null

    it "parses #{file}", ->
      ast = parser.parse(data, mode)
      assert ast

    it "compiles #{file}", ->
      data = compile(ast)

      assert data

describe 'Compiler', ->
  describe 'samples', ->
    describe 'haml', ->
      compileDirectory "test/samples/haml", "haml"

    describe 'jade', ->
      compileDirectory "test/samples/jade", "jade"

  describe "exports", ->
    it "defaults to module.exports", ->
      compiled = compile "%h1"

      assert compiled.match(/^module\.exports/)

    it "is removable by passing false", ->
      compiled = compile "%h1", exports: false

      assert compiled.match(/^\(function\(data\) \{/)
