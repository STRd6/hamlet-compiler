# TODO: Move into separate project
Observable = (value) ->
  listeners = []

  notify = (newValue) ->
    listeners.each (listener) ->
      listener(newValue)

  self = (newValue) ->
    if arguments.length > 0
      if value != newValue
        value = newValue

        notify(newValue)

    return value

  # TODO: If value is a function compute dependencies and listen
  # to observables that it depends on

  Object.extend self,
    observe: (listener) ->
      listeners.push listener
    each: (args...) ->
      # Don't add null or undefined values to iteration
      if value?
        [value].each(args...)

  # If value is array hook into array modification events
  # to keep things up to date
  if Array.isArray(value)
    Object.extend self,
      each: (args...) ->
        value.each(args...)

      map: (args...) ->
        value.map(args...)

      remove: (item) ->
        ret = value.remove(item)

        notify(value)

        return ret

      push: (item) ->
        ret = value.push(item)

        notify(value)

        return ret

      pop: ->
        ret = value.pop()

        notify(value)

        return ret

  return self

# Promote or "lift" an entity into a dummy object that
# matches the observable interface
Observable.lift = (object) ->
  if typeof object.observe is "function"
    object
  else
    value = object

    # Return a dummy observable
    dummy = (newValue) ->
      if arguments.length > 0
        value = newValue
      else
        value

    # No-op
    dummy.observe = ->

    dummy.each = (args...) ->
      if value?
        [value].forEach(args...)

    return dummy

module.exports = Observable
