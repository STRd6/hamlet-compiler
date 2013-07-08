
dataName = "__hamlJR_data"

Runtime = (context) ->
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
    top()?.appendChild(child)

    return child

  push = (child) ->
    stack.push(child)

  pop = ->
    append(stack.pop())

  observeAttribute = (element, name, value) ->
    update = (newValue) ->
      element.setAttribute name, newValue

    # CLI short-circuits here because it doesn't do observables
    unless Observable?
      update(value)
      return

    observable = Observable.lift(value)

    observable.observe update

    update observable()

    # TODO Unsubscribe

  observeText = (node, value) ->
    # CLI short-circuits here because it doesn't do observables
    unless Observable?
      node.nodeValue = value
      return

    observable = Observable.lift(value)

    update = (newValue) ->
      node.nodeValue = newValue

    observable.observe update

    update observable()

    unobserve = -> # TODO: Unsubscribe

    node.addEventListener("DOMNodeRemoved", unobserve, true)

  return {
    # Pushing and popping creates the node tree
    __push: push
    __pop: pop

    # TODO: Reconsider these observing methods
    __observeAttribute: observeAttribute
    __observeText: observeText

    __each: (items, fn) ->
      # TODO: Work with observable arrays
      # TODO: Work when rendering many sibling elements
      items.each (item) ->
        element = fn.call(item)
        element[dataName] = item

    __with: (item, fn) ->
      element = null

      item = Observable.lift(item)

      item.observe (newValue) ->
        replace element, newValue

      value = item()

      # TODO: Work when rendering many sibling elements
      replace = (oldElement, value) ->
        element = fn.call(value)
        element[dataName] = item

        if oldElement
          parent = oldElement.parentElement
          parent.insertBefore(element, oldElement)
          oldElement.remove()
        else
          # Assume we got added?

      replace(element, value)

    __on: (eventName, fn) ->
      element = lastParent()

      if eventName is "change"
        switch element.nodeName
          when "SELECT"
            element["on#{eventName}"] = ->
              selectedOption = @options[@selectedIndex]
              fn(selectedOption[dataName])

            # Add bi-directionality if binding to an observable
            if fn.observe
              fn.observe (newValue) ->
                Array::forEach.call(element.options, (option, index) ->
                  element.selectedIndex = index if option[dataName] is newValue
                )
          else
            element["on#{eventName}"] = ->
              fn(element.value)

            if fn.observe
              fn.observe (newValue) ->
                element.value = newValue

      else
        element["on#{eventName}"] = ->
          fn.call(context, event)
  }

(window ? exports).Runtime = Runtime
