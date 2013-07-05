
dataName = "__hamlJR_data"

Runtime = ->
  stack = []

  # HAX: A document fragment is not your real dad
  lastParent = ->
    i = stack.length - 1
    while (element = stack[i]) and element.nodeType is 11
      i -= 1

    element

  top = ->
    stack[stack.length-1]

  append = (child) ->
    top()?.appendChild(child) || child

  push = (child) ->
    stack.push(child)

  pop = ->
    append(stack.pop())

  fragment = (fn) ->
    push document.createDocumentFragment()
    fn()
    pop()

  observeAttribute = (element, name, value) ->
    value.observe? (newValue) ->
      element.setAttribute name, newValue

  observeText = (node, value) ->
    return unless value

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
    observing: (observable, fn) ->
      parent = lastParent()
      parent[dataName] = observable

      # TODO: Mixing and matching observables and non-observables is gross
      if typeof observable is "function"
        currentValue = observable()
      else
        currentValue = observable

      update = (currentValue) ->
        # TODO: Only replace the ones we'll add
        parent.innerHTML = ""
        if currentValue
          parent.appendChild fragment ->
            fn.call(currentValue)

      observable.observe? update

      if currentValue?
        update(currentValue)

    __on: (eventName, observable) ->
      element = lastParent()

      element["on#{eventName}"] = ->
        selectedOption = @options[@selectedIndex]
        observable(selectedOption[dataName])
  }

(window ? exports).Runtime = Runtime
