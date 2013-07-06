{parser} = require('./parser')
{lexer} = require('../build/lexer')
{renderJST} = require('./renderer')

require('./runtime')

parser.lexer = lexer

window.parser = parser
window.render = renderJST

# TODO: Load tempest.js for observable
window.Observable = (value) ->
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

  # TODO: If value is array hook into array modification events
  # to keep things up to date

  # TODO: If value is a function compute dependencies and listen
  # to observables that it depends on

  Object.extend self,
    observe: (listener) ->
      listeners.push listener
    each: (args...) ->
      # Don't add null or undefined values to iteration
      if value?
        [value].each(args...)

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

    dummy.each = (args...) ->
      if value?
        [value].forEach(args...)

    return dummy

templateHaml = """
  Choose a ticket class:
  %select
    - on "change", @chosenTicket
    - each @tickets, ->
      %option= @name

  %button Clear
    - on "click", @resetTicket

  - with @chosenTicket, ->
    %p
      - if @price
        You have chosen
        %b= @name
        %span
          $
          = @price
      - else
        No ticket chosen

"""

data =
  tickets: [
    {name: "None", price: null}
    {name: "Economy", price: 199.95}
    {name: "Business", price: 449.22}
    {name: "First Class", price: 1199.99}
  ]
  chosenTicket: Observable()
  resetTicket: ->
    @chosenTicket(@tickets[0])

$ ->
  ast = parser.parse(templateHaml)

  template = Function("return" + render(ast, compiler: CoffeeScript))()

  console.log template

  window.fragment = template(data)

  $('body').append(fragment)

