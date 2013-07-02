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
    content

  javascript: (content) ->
    indentedContent = indentText(content)
    """
      <script>
      #{indentedContent}
      </script>
    """
  coffeescript: (content) ->
    # TODO: Compile
    indentedContent = indentText(content)
    """
      <script type="text/coffeescript">
      #{indentedContent}
      </script>
    """

exports.render = (parseTree) ->
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
            classes.push(value)

            false
          else
            true
        .map ({name, value}) ->
          # TODO: Dynamic attributes
          "#{name}=#{value}"

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
        # TODO: Buffered Code
        # TODO: Unbuffered Code
        # TODO: Text
        if text = node.text
          contents = "#{indent}  #{text}"
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
