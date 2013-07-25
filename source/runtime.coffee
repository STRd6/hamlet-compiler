
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

  render = (object) ->
    {template} = object

    push HAMLjr.templates[template](object)
    pop()

  return {
    # Pushing and popping creates the node tree
    __push: push
    __pop: pop

    __observeAttribute: observeAttribute
    __observeText: observeText

    __each: (items, fn) ->
      items = Observable.lift(items)
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
          # TODO: We may have trouble if the list starts out empty so we can't
          # find the first element to insert into the correct position
          firstElement = oldElements[0]
          parent = firstElement?.parentElement

          elements = items.map (item) ->
            element = fn.call(item)
            element[dataName] = item

            parent.insertBefore element, firstElement

            return element

          oldElements.each (element) ->
            element.remove()
        else
          elements = items.map (item) ->
            element = fn.call(item)
            element[dataName] = item

            return element

      replace(null, items)

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
          # TODO: Make sure this context is correct for nested
          # things like `with` and `each`
          fn.call(context, event)
  }

exports.Runtime = Runtime
