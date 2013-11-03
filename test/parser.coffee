assert = require('assert')
fs = require('fs')

{jsdom} = require "jsdom"
global.document = document = jsdom()

{parser, compile} = HAMLjr = require('../dist/haml-jr')

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
      compiled = eval compile("#radical")
      result = compiled()

      assert.equal result.childNodes[0].id, "radical"

    it "should be overridden by the attribute value if present", ->
      compiled = eval compile("#radical(id=@id)")
      result = compiled
        id: "wat"

      assert.equal result.childNodes[0].id, "wat"

    it "should not be overridden by the attribute value if not present", ->
      compiled = eval compile("#radical(id=@id)")
      result = compiled()

      assert.equal result.childNodes[0].id, "radical"

    # TODO: Observable id attributes

  describe "text", ->
    it "should render text in nodes", ->
      compiled = eval compile("%div heyy")
      result = compiled()

      assert.equal result.childNodes[0].textContent, "heyy\n"
