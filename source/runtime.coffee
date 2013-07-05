
Runtime = ->
  stack = []

  append = (child) ->
    stack[stack.length-1]?.appendChild(child) || child

  push = (child) ->
    stack.push(child)

  pop = ->
    append(stack.pop())

  observeAttribute = (element, name, value) ->
    value.observe? (newValue) ->
      element.setAttribute name, newValue

  observeText = (node, value) ->
    if value.observe?
      value.observe (newValue) ->
        node.nodeValue newValue

      unobserve = ->
        console.log "Removed"

      node.addEventListener("DOMNodeRemoved", unobserve, true)

  return {
    # Pushing and popping creates the node tree
    __push: push
    __pop: pop

    # TODO:
    __observeAttribute: observeAttribute
    __observeText: observeText
  }

(window ? exports).Runtime = Runtime
