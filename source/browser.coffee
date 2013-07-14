{parser} = require('./haml-jr')
{renderJST, util} = require('./renderer')
Gistquire = require './gistquire'
styl = require('styl')

require('./runtime')

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

    # No-op
    dummy.observe = ->

    dummy.each = (args...) ->
      if value?
        [value].forEach(args...)

    return dummy

rerender = (->
  if location.search.match("embed")
    selector = "body"
  else
    selector = "#preview"

  # HACK for embedded
  return unless $("#template").length

  [coffee, haml, style] = editors.map (editor) -> editor.getValue()

  # TODO: Better error reporting
  ast = parser.parse(haml)

  template = Function("return " + render(ast, compiler: CoffeeScript))()

  data = Function("return " + CoffeeScript.compile("do ->\n" + util.indent(coffee), bare: true))()

  style = styl(style, whitespace: true).toString()

  $(selector)
    .empty()
    .append(template(data))
    .append("<style>#{style}</style>")

).debounce(100)

# TODO: Remote sample repos
save = ->
  data = $("#data").val()
  template = $("#template").val()
  style = $("#style").val()

  postData = JSON.stringify(
    public: true
    files:
      data:
        content: data
      template:
        content: template
      style:
        content: style
  )

  $.ajax "https://api.github.com/gists",
    type: "POST"
    dataType: 'json'
    data: postData
    success: (data) ->
      location.hash = data.id

load = (id) ->
  Gistquire.get id, (data) ->
    ["data", "template", "style"].each (file, i) ->
      content = data.files[file]?.content || ""
      editor = editors[i]
      editor.setValue(content)
      editor.moveCursorTo(0, 0)
      editor.session.selection.clearSelection()

    rerender()

$ ->
  window.editors = [
    ["data", "coffee"]
    ["template", "haml"]
    ["style", "stylus"]
  ].map ([id, mode]) ->
    editor = ace.edit(id)
    editor.setTheme("ace/theme/tomorrow");
    editor.getSession().setMode("ace/mode/#{mode}")
    editor.getSession().on 'change', rerender

    editor

  if id = location.hash
    load(id.substring(1))
  else
    rerender()

  $("#actions .save").on "click", save
