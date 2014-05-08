CoffeeScript = require "coffee-script"

indentText = (text, indent="  ") ->
  indent + text.replace(/\n/g, "\n#{indent}")

keywords = [
  "each"
]

keywordsRegex = RegExp("^\\s*(#{keywords.join('|')})\\s+")

util =
  indent: indentText

  filters:
    verbatim: (content, compiler) ->
      # TODO: Allow """ in content to stand
      compiler.buffer '"""' + content.replace(/(#)/, "\\$1") + '"""'

    plain: (content, compiler) ->
      compiler.buffer JSON.stringify(content)

    coffeescript: (content, compiler) ->
      [content]

    javascript: (content, compiler) ->
      [
        "`"
        compiler.indent(content)
        "`"
      ]

  element: (tag, contents=[]) ->
    lines = [
      "__runtime.push document.createElement(#{JSON.stringify(tag)})"
      contents...
      "__runtime.pop()"
    ]

  buffer: (value) ->
    [
      "__runtime.text #{value}"
    ]

  attributes: (node) ->
    {id, classes, attributes} = node

    if id
      ids = [JSON.stringify(id)]
    else
      ids = []

    classes = (classes || []).map JSON.stringify

    if attributes
      attributes = attributes.filter ({name, value}) ->
        if name is "class"
          classes.push value

          false
        else if name is "id"
          ids.push value

          false
        else
          true

    else
      attributes = []

    idsAndClasses = []

    if ids.length
      idsAndClasses.push "__runtime.id #{ids.join(', ')}"

    if classes.length
      idsAndClasses.push "__runtime.classes #{classes.join(', ')}"

    attributeLines = attributes.map ({name, value}) ->
      name = JSON.stringify(name)

      """
        __runtime.attribute #{name}, #{value}
      """

    return idsAndClasses.concat attributeLines

  render: (node) ->
    {tag, filter, text} = node

    if tag
      @tag(node)
    else if filter
      @filter(node)
    else
      @contents(node)

  replaceKeywords: (codeString) ->
    codeString.replace(keywordsRegex, "__runtime.$1 ")

  filter: (node) ->
    filterName = node.filter

    if filter = @filters[filterName]
      [].concat.apply([], @filters[filterName](node.content, this))
    else
      [
        "__runtime.filter(#{JSON.stringify(filterName)}, #{JSON.stringify(node.content)})"
      ]

  contents: (node) ->
    {children, bufferedCode, unbufferedCode, text} = node

    if unbufferedCode
      indent = true
      code = @replaceKeywords(unbufferedCode)

      contents = [code]
    else if bufferedCode
      contents = @buffer(bufferedCode)
    else if text
      contents = @buffer(JSON.stringify(text))
    else if node.tag
      contents = []
    else if node.comment
      # TODO: Create comment nodes
      return []
    else
      contents = []
      console.warn "No content for node:", node

    if children
      childContent = @renderNodes(children)

      if indent
        childContent = @indent(childContent.join("\n"))

      contents = contents.concat(childContent)

    return @attributes(node).concat contents

  renderNodes: (nodes) ->
    [].concat.apply([], nodes.map(@render, this))

  tag: (node) ->
    {tag} = node

    @element tag, @contents(node)

exports.compile = (parseTree, {compiler, runtime}={}) ->
  compiler ?= CoffeeScript
  runtime ?= "require(\"hamlet-runtime\")"

  items = util.renderNodes(parseTree)

  source = """
    (data) ->
      (->
        __runtime = #{runtime}(this)

        __runtime.push document.createDocumentFragment()
    #{util.indent(items.join("\n"), "    ")}
        __runtime.pop()
      ).call(data)
  """

  options = bare: true
  programSource = source

  program = compiler.compile programSource, options

  return program
