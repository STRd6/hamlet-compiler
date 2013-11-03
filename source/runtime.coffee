
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

  render = (child) ->
    push(child)
    pop()

  bindObservable = (element, value, update) ->
    # CLI short-circuits here because it doesn't do observables
    unless Observable?
      update(value)
      return

    observable = Observable(value)
    observable.observe update
    update observable()

    # TODO: Unsubscribe
    # element.addEventListener("DOMNodeRemoved", unobserve, true)

  id = (sources...) ->
    element = top()

    update = (newValue) ->
      # HACK: Working around CLI not having observables
      if typeof newValue is "function"
        newValue = newValue()

      element.id = newValue

    value = ->
      possibleValues = sources.map (source) ->
        if typeof source is "function"
          source()
        else
          source
      .filter (idValue) ->
        idValue?

      possibleValues[possibleValues.length-1]

    bindObservable(element, value, update)

  classes = (sources...) ->
    element = top()

    update = (newValue) ->
      # HACK: Working around CLI not having observables
      if typeof newValue is "function"
        newValue = newValue()

      element.className = newValue

    value = ->
      possibleValues = sources.map (source) ->
        if typeof source is "function"
          source()
        else
          source
      .filter (sourceValue) ->
        sourceValue?

      possibleValues.join(" ")

    bindObservable(element, value, update)

  observeAttribute = (name, value) ->
    element = top()

    update = (newValue) ->
      element.setAttribute name, newValue

    bindObservable(element, value, update)

  observeText = (value) ->
    # Kind of a hack for handling sub renders
    # or adding explicit html nodes to the output
    # TODO: May want to make more sure that it's a real dom node
    #       and not some other object with a nodeType property
    # TODO: This shouldn't be inside of the observeText method
    switch value?.nodeType
      when 1, 3, 11
        render(value)
        return

    # HACK: We don't want to know about the document inside here,
    # even grabbing the ownerDocument is probably too much.
    # Creating our text nodes in here cleans up the external call
    # so it may be worth it.
    element = top().ownerDocument.createTextNode('')

    update = (newValue) ->
      element.nodeValue = newValue

    bindObservable element, value, update

    render element

  return {
    # Pushing and popping creates the node tree
    push: push
    pop: pop

    id: id
    classes: classes
    attribute: observeAttribute
    text: observeText

    filter: (name, content) ->
      ; # TODO self.filters[name](content)

    each: (items, fn) ->
      items = Observable(items)
      elements = []
      parent = lastParent()

      # TODO: Work when rendering many sibling elements
      items.observe (newItems) ->
        replace elements, newItems

      replace = (oldElements, items) ->
        if oldElements
          # TODO: There a lot of trouble if we can't find a parent
          # We may be able to hack around it by observing when
          # we're inserted into the dom and finding out what parent element
          # we have
          firstElement = oldElements[0]
          parent = firstElement?.parentElement || parent

          elements = items.map (item, index, array) ->
            element = fn.call(item, item, index, array)
            element[dataName] = item

            parent.insertBefore element, firstElement

            return element

          oldElements.each (element) ->
            element.remove()
        else
          elements = items.map (item, index, array) ->
            element = fn.call(item, item, index, array)
            element[dataName] = item

            return element

      replace(null, items)

    with: (item, fn) ->
      element = null

      item = Observable(item)

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

    on: (eventName, fn) ->
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
          # TODO: Make sure this context is correct for nested
          # things like `with` and `each`
          fn.call(context, event)
  }

exports.Runtime = Runtime
