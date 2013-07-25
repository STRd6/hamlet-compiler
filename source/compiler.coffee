CoffeeScript = require "coffee-script"
styl = require 'styl'

indentText = (text, indent="  ") ->
  indent + text.replace(/\n/g, "\n#{indent}")

keywords = [
  "on"
  "each"
  "with"
  "render"
]

keywordsRegex = RegExp("\\s*(#{keywords.join('|')})\\s+")

util =
  indent: indentText

  filters:
    styl: (content, compiler) ->
      compiler.styleTag styl(content, whitespace: true).toString()

    verbatim: (content, compiler) ->
      # TODO: Allow """ in content to stand
      compiler.buffer '"""' + content.replace(/(#)/, "\\$1") + '"""'

    plain: (content, compiler) ->
      compiler.buffer JSON.stringify(content)

    coffeescript: (content, compiler) ->
      if compiler.explicitScripts
        [
          compiler.scriptTag(CoffeeScript.compile(content))
        ]
      else
        [content]

    javascript: (content, compiler) ->
      if compiler.explicitScripts
        [
          compiler.scriptTag(content)
        ]
      else
        [
          "`"
          compiler.indent(content)
          "`"
        ]

  styleTag: (content) ->
    @element "style", [], [
      "__element.innerHTML = #{JSON.stringify("\n" + @indent(content))}"
    ]

  scriptTag: (content) ->
    @element "script", [], [
      "__element.innerHTML = #{JSON.stringify("\n" + @indent(content))}"
    ]

  element: (tag, attributes, contents=[]) ->
    attributeLines = attributes.map ({name, value}) ->
      name = JSON.stringify(name)

      """
        __observeAttribute __element, #{name}, #{value}
      """

    lines = [
      "__element = document.createElement(#{JSON.stringify(tag)})"
      "__push(__element)"
      attributeLines...
      contents...
      "__pop()"
    ]

  buffer: (value) ->
    [
      "__element = document.createTextNode('')"
      "__observeText(__element, #{value})"
      "__push __element"
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

    return attributes

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
    [].concat.apply([], @filters[node.filter](node.content, this))

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

    return contents

  renderNodes: (nodes) ->
    [].concat.apply([], nodes.map(@render, this))

  tag: (node) ->
    {tag} = node

    attributes = @attributes(node)
    contents = @contents(node)

    @element tag, attributes, contents

exports.util = util

exports.compile = (parseTree, {explicitScripts, name, compiler}={}) ->
  # HAX: Browserify can't put CoffeeScript into the web...
  if compiler
    CoffeeScript = compiler

  util.explicitScripts = explicitScripts

  items = util.renderNodes(parseTree)

  source = """
    (data) ->
      (->
        {
          __push
          __pop
          __observeAttribute
          __observeText
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

  if name
    options = {}
    programSource = """
      @HAMLjr ||= {}
      @HAMLjr.templates ||= {}
      @HAMLjr.templates[#{JSON.stringify(name)}] = #{source}
    """
  else
    options = bare: true
    programSource = source

  try
    program = CoffeeScript.compile programSource, options

    return program
  catch error
    process.stderr.write "COMPILE ERROR:\n  SOURCE:\n #{programSource}\n"

    throw error
