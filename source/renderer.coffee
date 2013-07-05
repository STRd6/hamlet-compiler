CoffeeScript = require "coffee-script"
{Runtime} = require("./runtime")

selfClosing =
  area: true
  base: true
  br: true
  col: true
  hr: true
  img: true
  input: true
  link: true
  meta: true
  param: true

indentText = (text, indent="  ") ->
  indent + text.replace(/\n/g, "\n#{indent}")

keywords = [
  "on"
  "each"
]

keywordsRegex = RegExp("\\s*(#{keywords.join('|')})\\s+")

# JST Renderer Util
util =
  selfClosing: selfClosing

  indent: indentText

  filters:
    # TODO: This is actualy 'compileTime' rather than runtime
    plain: (content, runtime) ->
      runtime.buffer JSON.stringify(content)

    coffeescript: (content, runtime) ->
      if runtime.explicitScripts
        [
          runtime.scriptTag(CoffeeScript.compile(content))
        ]
      else
        [content]

    javascript: (content, runtime) ->
      if runtime.explicitScripts
        [
          runtime.scriptTag(content)
        ]
      else
        [
          "`"
          runtime.indent(content)
          "`"
        ]

  scriptTag: (content) ->
    @element "script", [], [
      "__element.innerHTML = #{JSON.stringify("\n" + @indent(_.escape(content)))}"
    ]

  element: (tag, attributes, contents=[]) ->
    attributeLines = attributes.map ({name, value}) ->
      name = JSON.stringify(name)

      """
        __observeAttribute __element, #{name}, #{value}
        __element.setAttribute #{name}, #{value}
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
      "__element = document.createTextNode(#{value})"
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

exports.renderJST = (parseTree, {explicitScripts, name, compiler}={}) ->
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
          observing
        } = Runtime(this) # TODO Namespace

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
