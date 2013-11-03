CoffeeScript = require "coffee-script"

indentText = (text, indent="  ") ->
  indent + text.replace(/\n/g, "\n#{indent}")

keywords = [
  "on"
  "each"
  "with"
  "render"
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
      "__push document.createElement(#{JSON.stringify(tag)})"
      contents...
      "__pop()"
    ]

  buffer: (value) ->
    [
      "__push document.createTextNode('')"
      "__text(#{value})"
      "__pop()"
    ]

  stringJoin: (values) ->
    {dynamic} = this

    values = values.map (value) ->
      if value.indexOf("\"") is 0
        JSON.parse(value)
      else
        dynamic(value)

    JSON.stringify(values.join(" "))

  dynamic: (value) ->
    "\#{#{value}}"

  attributes: (node) ->
    {dynamic} = this
    {id, classes, attributes} = node

    classes = (classes || []).map JSON.stringify
    attributeId = undefined

    if attributes
      attributes = attributes.filter ({name, value}) ->
        if name is "class"
          classes.push value

          false
        else if name is "id"
          attributeId = value

          false
        else
          true

    else
      attributes = []

    if classes.length
      attributes.unshift name: "class", value: @stringJoin(classes)

    if attributeId
      attributes.unshift name: "id", value: attributeId
    else if id
      attributes.unshift name: "id", value: JSON.stringify(id)

    attributeLines = attributes.map ({name, value}) ->
      name = JSON.stringify(name)

      """
        __attribute #{name}, #{value}
      """

    return attributeLines

  render: (node) ->
    {tag, filter, text} = node

    if tag
      @tag(node)
    else if filter
      @filter(node)
    else
      @contents(node)

  replaceKeywords: (codeString) ->
    codeString.replace(keywordsRegex, "__$1 ")

  filter: (node) ->
    filterName = node.filter

    if filter = @filters[filterName]
      [].concat.apply([], @filters[filterName](node.content, this))
    else
      [
        "__filter(#{JSON.stringify(filterName)}, #{JSON.stringify(node.content)})"
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

exports.compile = (parseTree, {compiler}={}) ->
  # HAX: Browserify can't put CoffeeScript into the web...
  if compiler
    CoffeeScript = compiler

  items = util.renderNodes(parseTree)

  source = """
    (data) ->
      (->
        {
          __push
          __pop
          __attribute
          __filter
          __text
          __on
          __each
          __with
          __render
        } = HAMLjr.Runtime(this)

        __push document.createDocumentFragment()
    #{util.indent(items.join("\n"), "    ")}
        __pop()
      ).call(data)
  """

  options = bare: true
  programSource = source

  program = CoffeeScript.compile programSource, options

  return program
