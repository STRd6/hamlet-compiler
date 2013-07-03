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

    if node.tag and node.text
      nodeHaml += " #{node.text}"
    else if node.text
      nodeHaml += node.text

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
