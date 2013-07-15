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

  try
    data = Function("return " + CoffeeScript.compile("do ->\n" + util.indent(coffee), bare: true))()
    $("#errors p").eq(0).empty()
  catch error
    $("#errors p").eq(0).text(error)

  try
    ast = parser.parse(haml + "\n")
    template = Function("return " + render(ast, compiler: CoffeeScript))()
    $("#errors p").eq(1).empty()
    $("#debug code").eq(1).text(template)
  catch error
    $("#errors p").eq(1).text(error)

  try
    style = styl(style, whitespace: true).toString()
    $("#errors p").eq(2).empty()
  catch error
    $("#errors p").eq(2).text(error)


  if template? and data?
    try
      fragment = template(data)

      $(selector)
        .empty()
        .append(fragment)
        .append("<style>#{style}</style>")

    catch error
      $("#errors p").eq(1).text(error)

).debounce(100)

postData = ->
  [data, template, style] = editors.map (editor) ->
    editor.getValue()

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

# TODO: Remote sample repos
save = ->
  Gistquire.create postData(), (data) ->
    location.hash = data.id

auth = ->
  url = 'https://github.com/login/oauth/authorize?client_id=bc46af967c926ba4ff87&scope=gist,user:email'

  window.location = url

load = (id) ->
  Gistquire.get id, (data) ->
    ["data", "template", "style"].each (file, i) ->
      content = data.files[file]?.content || ""
      editor = editors[i]
      editor.setValue(content)
      editor.moveCursorTo(0, 0)
      editor.session.selection.clearSelection()

    rerender()

update = ->
  if id = location.hash?.substring(1)
    Gistquire.update id, postData(), (data) ->

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
    editor.getSession().setUseSoftTabs(true)
    editor.getSession().setTabSize(2)

    editor

  if code = window.location.href.match(/\?code=(.*)/)?[1]
    $.getJSON 'https://hamljr-auth.herokuapp.com/authenticate/#{code}', (data) ->
      if token = data.token
        Gistquire.authToken = token
        localStorage.authToken = token

  if id = location.hash?.substring(1)
    load(id)
  else
    rerender()

  if localStorage.authToken
    Gistquire.accessToken = localStorage.authToken

  $("#actions .save").on "click", save
  $("#actions .auth").on "click", auth
  $("#actions .update").on "click", update
