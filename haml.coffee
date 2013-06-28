
{node:o, create} = require "./grammar_dsl"

grammar =
  root: [
    o "lines"
  ]

  lines: [
    o "lines line",                                  -> $lines.concat $line
    o "line",                                        -> [$line]
  ]

  indentation: [
    o "indentation INDENT",                          -> yy.indent = $1 + 1
    o "INDENT",                                      -> yy.indent = 1
  ]

  line: [
    o "DOCTYPE end",                                 -> "doctype"
    o "indentation lineMain end",                    -> $lineMain.indentation = $indentation; $lineMain
    o "lineMain end",                                -> yy.indent = 0; $lineMain
    o "end"
  ]

  lineMain: [
    o "FILTER",                                      -> yy.lexer.begin('filter'); filter: $1
    o "tag rest",                                    -> yy.extend $tag, $rest
    o "tag",                                         -> $tag
    o "rest",                                        -> $rest
    o "FILTER_LINE"
  ]

  end: [
    o "NEWLINE"
    o "EOF"
  ]

  tag: [
    o "PERCENT name tagComponents",                  -> $3.tag = $2; $3
    o "PERCENT name attributes",                     -> tag: $2, attributes: $3
    o "PERCENT name",                                -> tag: $2
    o "tagComponents"
  ]

  tagComponents: [
    o "idComponent classComponents attributes",      -> id: $1, classes: $2, attributes: $3
    o "idComponent attributes",                      -> id: $2, attributes: $2
    o "classComponents attributes",                  -> classes: $1, attributes: $2
    o "idComponent classComponents",                 -> id: $1, classes: $2
    o "idComponent",                                 -> id: $2
    o "classComponents",                             -> classes: $1
  ]

  idComponent: [
    o "OCTOTHORPE name",                             -> $2
  ]

  classComponents: [
    o "classComponents classComponent",              -> $1.concat $2
    o "classComponent",                              -> [$1]
  ]

  classComponent: [
    o "PERIOD name",                                 -> $2
  ]

  attributes: [
    o "attributesParenthesesStart attributePairs RIGHT_PARENTHESIS", -> $2
    o "attributesBraceStart attributeBraceContent RIGHT_BRACE", -> $2
  ]

  attributesBraceStart: [
    o "LEFT_BRACE",                                  -> yy.lexer.begin("brace_attributes")
  ]

  attributeBraceContent: [
    # TODO Real content
    o "TEXT"
  ]

  attributesParenthesesStart: [
    o "LEFT_PARENTHESIS",                            -> yy.lexer.begin("parentheses_attributes")
  ]

  attributePairs: [
    o "attributePairs WHITESPACE attributePair",     -> $1.concat $2
    o "attributePair",                               -> [$1]
  ]

  attributePair: [
    o "ATTRIBUTE EQUAL attributeExpression",              -> [$1, $3]
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
    o "ALPHABETICAL"
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

extend parser.yy,
  indent: 0
  extend: extend

exports.parser = parser
