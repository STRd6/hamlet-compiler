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

exports.render = (parseTree) ->
  renderNode = (node, indent="") ->
    if node.filter
      # TODO: Non-plain filters
      # plain
      contents = node.content.split("\n").join("#{indent}\n")

      return "#{indent}#{contents}"
    else if tag = node.tag
      classes = node.classes or []

      # Attributes
      if attributes = node.attributes
        attributes = node.attributes.filter ({name, value}) ->
          if name is "class"
            classes.push(value)

            false
          else
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
        contents = (node.children || []).map (node) ->
          renderNode node, "#{indent}  "
        .join("\n")

        return """
          #{indent}#{opener}
          #{contents}
          #{indent}#{closer}
        """

  parseTree.map (node) ->
    renderNode(node)
  .join("\n")

exports.renderHaml = (parseTree) ->
