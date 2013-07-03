Coffee = require "coffee-script"

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

filters =
  plain: (content) ->
    # TODO: Allow for interpolation
    content

  javascript: (content) ->
    indentedContent = indentText(content)
    """
      <script>
      #{indentedContent}
      </script>
    """
  coffeescript: (content) ->
    # TODO: Should we compile to JS at parse time?
    code = Coffee.compile(content)
    indentedCode = indentText(code)
    """
      <script>
      #{indentedCode}
      </script>
    """

# JST Renderer Util
util =
  selfClosing: selfClosing

  indent: indentText

  filters:
    plain: (content, runtime) ->
      runtime.buffer content

    coffeescript: (content) ->
      content

    javascript: (content, runtime) ->
      # TODO: Is this what we want?
      runtime.buffer """
        <script>
        #{runtime.indent(content)}
        </script>
      """

  buffer: (value) ->
    "__buffer.push #{JSON.stringify(value)}"

  endsWith: (string, suffix) ->
    string.indexOf(suffix, string.length - suffix.length) != -1

  # We could either assume an unbuffered code node with children is a block
  # or do a check.
  # This is doing the check for CoffeeScript style blocks.
  isBlock: (code) ->
    @endsWith code, "->"

  dynamic: (value) ->
    "\#{#{value}}"

  attributes: (node) ->
    {dynamic} = this
    {id, classes, attributes} = node

    classes ||= []

    if attributes
      attributes = attributes.filter ({name, value}) ->
        if name is "class"
          classes.push(dynamic(value))

          false
        else
          true
      .map ({name, value}) ->
        "#{name}=#{value}"

    else
      attributes = []

    if classes.length
      classAttribute = "class=\"#{classes.join(" ")}\""
      attributes.unshift(classAttribute)

    if id = node.id
      idAttribute = "id=#{id}"
      attributes.unshift(idAttribute)

    if attributes.length
      " #{attributes.join(" ")}"
    else
      ""

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
    @filters[node.filter](node.content, this)

  contents: (node) ->
    {children, bufferedCode, unbufferedCode, text} = node

    if unbufferedCode
      if @isBlock(unbufferedCode)
        childContent = @renderNodes(children or []) + "\nundefined"
        contents =
          """
            #{unbufferedCode}
            #{@indent(childContent)}
          """
      else
        contents = unbufferedCode
    else if bufferedCode
      contents = @buffer(@dynamic(bufferedCode))
    else if text
      contents = @buffer text
    else if children
      contents = @renderNodes(children)
    else
      console.warn "No content for node:", node

  renderNodes: (nodes) ->
    nodes.map(@render, this).join("\n")

  tag: (node) ->
    {tag} = node

    attributes = @attributes(node)
    contents = @contents(node)

    if @selfClosing[tag]
      @buffer "<#{tag}#{attributes} />"
    else
      [
        @buffer "<#{tag}#{attributes}>"
        contents
        @buffer "<#{tag} />"
      ].join("\n")

exports.render = (parseTree) ->
  # TODO: Real context
  context = {}

  contextEval = (code) ->
    eval(code)

  dynamicCode = (source) ->
    code = Coffee.compile(source, bare: true)

    contextEval.call context, code

  renderDynamicValue = (source) ->
    code = Coffee.compile(source, bare: true)

    JSON.stringify(contextEval.call(context, code))

  renderNode = (node, indent="") ->
    if filter = node.filter
      if processor = filters[filter]
        contents = indentText(processor(node.content), indent)
      else
        throw "Unknown filter: #{filter}"

      return "#{contents}"
    else if tag = node.tag
      attributes = util.attributes(node)

      if attributes
        opener = "<#{tag}#{attributes}>"
      else
        opener = "<#{tag}>"

      closer = "</#{tag}>"

      if selfClosing[tag]
        # TODO: Warn if tag has contents
        return "<#{tag}#{attributes}/>"
      else
        if source = node.unbufferedCode
          dynamicCode(source)

          # TODO: Render children within context
        else if source = node.bufferedCode
          contents = dynamicCode(source)
        else if text = node.text
          contents = text
        else
          contents = (node.children || []).map (node) ->
            renderNode node
          .join("\n")

        if contents
          return """
            #{opener}
            #{indentText(contents)}
            #{closer}
          """
        else
          "#{opener}#{closer}"

    else if text = node.text
      return text

  parseTree.map (node) ->
    renderNode(node)
  .join("\n")

exports.renderJST = (parseTree) ->
  source = util.renderNodes(parseTree)

  try
    Coffee.compile source, bare: true
  catch error
    console.log "COMPILE ERROR:\n  SOURCE:\n", source
    console.log error

exports.renderHaml = (parseTree) ->
  renderNode = (node) ->
    if filter = node.filter
      nodeHaml = """
        :#{filter}
        #{indentText(node.content)}
      """
    else if tag = node.tag
      pieces = []

      if tag != "div"
        pieces.push "%#{tag}"

      pieces.push "##{node.id}" if node.id

      pieces = pieces.concat(node.classes.map (className) -> ".#{className}") if node.classes

      nodeHaml = pieces.join('')

      if attributes = node.attributes
        attributeText = attributes.map(({name, value}) -> "#{name}=#{value}").join(' ')
        nodeHaml += "(#{attributeText})"
    else
      # TODO!
      nodeHaml = ""

    nodeHaml += "- #{node.unbufferedCode}" if node.unbufferedCode
    nodeHaml += "= #{node.bufferedCode}" if node.bufferedCode
    nodeHaml += " #{node.text}" if node.text

    if node.children
      childrenHaml = node.children.map (node) ->
        renderNode node
      .join("\n")

      return """
        #{nodeHaml}
        #{indentText(childrenHaml)}
      """
    else
      "#{nodeHaml}"

  parseTree.map (node) ->
    renderNode(node)
  .join("\n")
