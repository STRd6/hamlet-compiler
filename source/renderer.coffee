CoffeeScript = require "coffee-script"

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

# JST Renderer Util
util =
  selfClosing: selfClosing

  indent: indentText

  filters:
    plain: (content, runtime) ->
      runtime.buffer content

    coffeescript: (content) ->
      [content]

    javascript: (content, runtime) ->
      ["""
        `
        #{runtime.indent(content)}
        `
      """]

  fragment: (contents=[]) ->
    lines = [
      "__push document.createDocumentFragment()"
      contents...
      "__pop()"
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
    value = JSON.stringify(value)

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
    else if text
      @buffer text
    else
      @contents(node)

  filter: (node) ->
    [].concat.apply([], @filters[node.filter](node.content, this))

  contents: (node) ->
    {children, bufferedCode, unbufferedCode, text} = node

    if unbufferedCode
      if children
        childContent = @renderNodes(children)
        contents = [
          unbufferedCode
          @indent(childContent.join("\n"))
        ]
      else
        contents = [unbufferedCode]
    else if bufferedCode
      contents = @buffer(@dynamic(bufferedCode))
    else if text
      contents = @buffer text
    else if children
      contents = @renderNodes(children)
    else if node.tag
      # Don't care, already rendered it in @tag
    else
      console.warn "No content for node:", node

  renderNodes: (nodes) ->
    @fragment([].concat.apply([], nodes.map(@render, this)))

  tag: (node) ->
    {tag} = node

    attributes = @attributes(node)
    contents = @contents(node)

    @element tag, attributes, contents

exports.renderJST = (parseTree, name) ->
  items = util.renderNodes(parseTree)

  source = """
    (data) ->
      (->
        __stack = []

        __append = (child) ->
          __stack[__stack.length-1]?.appendChild(child) || child

        __push = (child) ->
          __stack.push(child)

        __pop = ->
          __append(__stack.pop())

        __observeAttribute = (element, name, value) ->
          value.observe? (newValue) ->
            element.setAttribute name, newValue

        __observeText = (node, value) ->
          value.observe? (newValue) ->
            node.nodeValue newValue

    #{util.indent(items.join("\n"), "    ")}).call(data)
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
    console.log "COMPILE ERROR:\n  SOURCE:\n", programSource
    console.log error
