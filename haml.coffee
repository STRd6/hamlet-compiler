
{node:o, create} = require "./grammar_dsl"

grammar =
  root: [
    o "lines",                                       -> yy.nodePath[0].children
  ]

  lines: [
    o "lines line"
    o "line"
  ]

  indentation: [
    o "",                                            -> 0
    o "indentationLevel"
  ]

  indentationLevel: [
    o "indentationLevel INDENT",                     -> $1 + 1
    o "INDENT",                                      -> 1
  ]

  line: [
    o "DOCTYPE end",                                 -> "doctype"
    o "indentation lineMain end",                    -> yy.append($lineMain, $indentation)
    o "end"
  ]

  lineMain: [
    o "FILTER",                                      -> filter: $1.substring(1)
    o "tag rest",                                    -> yy.extend $tag, $rest
    o "tag",                                         -> $tag
    o "rest",                                        -> $rest
    o "FILTER_LINE",                                 -> filterLine: $1
  ]

  end: [
    o "NEWLINE"
    o "EOF"
  ]

  tag: [
    o "name tagComponents",                          -> $tagComponents.tag = $name; $tagComponents
    o "name attributes",                             -> tag: $name, attributes: $attributes
    o "name",                                        -> tag: $name
    o "tagComponents",                               -> yy.extend $tagComponents, tag: "div"
  ]

  tagComponents: [
    o "idComponent classComponents attributes",      -> id: $idComponent, classes: $classComponents, attributes: $attributes
    o "idComponent attributes",                      -> id: $idComponent, attributes: $attributes
    o "classComponents attributes",                  -> classes: $classComponents, attributes: $attributes
    o "idComponent classComponents",                 -> id: $idComponent, classes: $classComponents
    o "idComponent",                                 -> id: $idComponent
    o "classComponents",                             -> classes: $classComponents
  ]

  idComponent: [
    o "ID",                                          -> $1.substring(1)
  ]

  classComponents: [
    o "classComponents classComponent",              -> $1.concat $2
    o "classComponent",                              -> [$1]
  ]

  classComponent: [
    o "CLASS",                                       -> $1.substring(1)
  ]

  attributes: [
    o "attributesParenthesesStart attributePairs RIGHT_PARENTHESIS", -> $2
    o "attributesBraceStart attributePairs RIGHT_BRACE", -> $2
  ]

  attributesBraceStart: [
    o "LEFT_BRACE",                                  -> yy.lexer.begin("brace_attributes")
  ]

  attributesParenthesesStart: [
    o "LEFT_PARENTHESIS",                            -> yy.lexer.begin("parentheses_attributes")
  ]

  attributePairs: [
    o "attributePairs SEPARATOR attributePair",      -> $attributePairs.concat $attributePair
    o "attributePair",                               -> [$attributePair]
  ]

  attributePair: [
    o "ATTRIBUTE EQUAL attributeExpression",         -> name: $1, value: $3
  ]

  attributeExpression: [
    o "STRING"
    o "ATTRIBUTE_VALUE"
  ]

  optionalWhitespace: [
    o ""
    o "WHITESPACE"
  ]

  name: [
    o "TAG",                                         -> $1.substring(1)
  ]

  rest: [
    o "bufferedCode",                                -> { bufferedCode: $1 }
    o "unbufferedCode",                              -> { unbufferedCode: $1 }
    o "text",                                        -> { text: $1 }
  ]

  bufferedCode: [
    o "beginBufferedCode CODE",                      -> $2
  ]

  unbufferedCode: [
    o "beginUnbufferedCode CODE",                    -> $2
  ]

  text: [
    o "beginText TEXT",                              -> $2
    o "TEXT"
  ]

  beginBufferedCode: [
    o "EQUAL optionalWhitespace",                    -> yy.lexer.begin('code')
  ]

  beginUnbufferedCode: [
    o "HYPHEN optionalWhitespace",                   -> yy.lexer.begin('code')
  ]

  beginText: [
    o "WHITESPACE",                                  -> yy.lexer.begin('text')
  ]

operators = []

parser = create
  grammar: grammar
  operators: operators
  startSymbol: "root"

extend = (target, sources...) ->
  for source in sources
    for name of source
      target[name] = source[name]

  return target

oldParse = parser.parse
extend parser,
  parse: (input) ->
    # Initialize shared state for gross hacks
    extend parser.yy,
      indent: 0
      nodePath: [{children: []}]
      filterIndent: undefined

    return oldParse.call(parser, input)

extend parser.yy,
  extend: extend
  append: (node, indentation=0) ->
    if node.filterLine
      lastNode = @nodePath[@nodePath.length - 1]
      @appendFilterContent(lastNode, node.filterLine)

      return

    parent = @nodePath[indentation]
    @appendChild parent, node

    index = indentation + 1
    @nodePath[index] = node
    @nodePath.length = index + 1

    return node

  appendChild: (parent, child) ->
    unless child.filter
      @filterIndent = undefined
      # Resetting back to initial state so we can handle
      # back to back filters
      @lexer.popState()

    parent.children ||= []
    parent.children.push child

  appendFilterContent: (filter, content) ->
    filter.content ||= ""
    filter.content += "#{content}\n"

exports.parser = parser
