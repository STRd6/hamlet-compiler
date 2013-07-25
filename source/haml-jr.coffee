{compile, util} = require "./compiler"
{lexer} = require "./lexer" # This is only in the build dir right now
{parser} = require "./parser"
{Runtime} = require "./runtime"

extend = (target, sources...) ->
  for source in sources
    for name of source
      target[name] = source[name]

  return target

oldParse = parser.parse
extend parser,
  lexer: lexer
  parse: (input) ->
    # Initialize shared state for gross hacks
    extend parser.yy,
      indent: 0
      nodePath: [{children: []}]
      filterIndent: undefined

    return oldParse.call(parser, input)

extend parser.yy,
  extend: extend

  newline: ->
    lastNode = @nodePath[@nodePath.length - 1]

    # TODO: Add newline nodes to tree to maintain
    # spacing

    if lastNode.filter
      @appendFilterContent(lastNode, "")

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

extend exports,
  compile: compile
  parser: parser
  Runtime: Runtime
  util: util
