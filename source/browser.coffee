{parser} = require('./parser')
{lexer} = require('../build/lexer')
{renderJST} = require('./renderer')

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
        [].concat(value).each(args...)

  return self

templateHaml = """
  Choose a ticket class:
  %select
    - @tickets.each (ticket) ->
      %option
        = ticket.name

  %p
    - @chosenTicket.each (ticket) ->
      You have chosen
      %b= ticket.name
      %span
        $
        = ticket.price

"""

data =
  tickets: Observable [
    {name: "Economy", price: 199.95}
    {name: "Business", price: 449.22}
    {name: "First Class", price: 1199.99}
  ]
  chosenTicket: Observable()

$ ->
  ast = parser.parse(templateHaml)

  template = Function("return" + render(ast, compiler: CoffeeScript))()

  console.log template

  window.fragment = template(data)

  $('body').append(fragment)

  $('body').on "change", "select", ->
    console.log value = $(this).val()
    data.chosenTicket(value)
