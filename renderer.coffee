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
      classes = node.classes or []

      # Attributes
      if attributes = node.attributes
        attributes = node.attributes.filter ({name, value}) ->
          if name is "class"
            classes.push(renderDynamicValue(value))

            false
          else
            true
        .map ({name, value}) ->
          "#{name}=#{renderDynamicValue(value)}"

      else
        attributes = []

      if classes.length
        classAttribute = "class=\"#{classes.join(" ")}\""
        attributes.unshift(classAttribute)

      if id = node.id
        idAttribute = "id=\"#{id}\""
        attributes.unshift(idAttribute)

      attributes = attributes.join(" ")

      if attributes
        opener = "<#{tag} #{attributes}>"
      else
        opener = "<#{tag}>"

      closer = "</#{tag}>"

      if selfClosing[tag]
        # TODO: Warn if tag has contents
        return "#{indent}<#{tag} #{attributes}/>"
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
      return "#{indent}#{text}"

  parseTree.map (node) ->
    renderNode(node)
  .join("\n")

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
