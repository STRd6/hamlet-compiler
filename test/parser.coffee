assert = require('assert')
fs = require('fs')

{jsdom} = require "jsdom"
global.document = document = jsdom()

Runtime = require "../dist/runtime"
{parser, compile} = HAMLjr = require('../dist/haml-jr')

schwaza = (template, data) ->
  code = "return " + compile(template)

  fragment = Function("Runtime", code)(Runtime)(data)

  div = document.createElement("div")
  div.appendChild fragment

  return div

describe 'HAMLjr', ->
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

      it "should replace `on 'click'` with `__runtime.on 'click'`", ->
        compiled = compile('- on "click", ->')

        assert compiled.match(/__runtime.on\("click"/)

  describe "runtime", ->
    it "should not blow up on undefined text node values", ->
      compiled = compile('= @notThere')
      assert eval(compiled)()

  describe "classes", ->
    it "should render the classes passed in along with the classes prefixed", ->
      compiled = eval compile(".radical(class=@myClass)")
      result = compiled
        myClass: "duder"

      assert.equal result.childNodes[0].className, "radical duder"

    # TODO: Observable class attributes

  describe "ids", ->
    it "should get them from the prefix", ->
      result = schwaza("#radical")

      assert.equal result.childNodes[0].id, "radical"

    it "should be overridden by the attribute value if present", ->
      result = schwaza "#radical(id=@id)",
        id: "wat"

      assert.equal result.childNodes[0].id, "wat"

    it "should not be overridden by the attribute value if not present", ->
      result = schwaza "#radical(id=@id)"

      assert.equal result.childNodes[0].id, "radical"

    # TODO: Observable id attributes

  describe "text", ->
    it "should render text in nodes", ->
      result = schwaza("%div heyy")

      assert.equal result.childNodes[0].textContent, "heyy\n"
