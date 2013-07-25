{parser, compile, util} = HAMLjr = require('./haml-jr')
Gistquire = require './gistquire'
styl = require('styl')

window.HAMLjr = HAMLjr
window.Observable = require('./observable')

window.parser = parser

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
    template = Function("return " + compile(ast, compiler: CoffeeScript))()
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

  JSON.stringify(
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
