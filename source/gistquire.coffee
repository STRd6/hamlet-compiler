module.exports =
  accessToken: null

  update: (id, data, callback) ->
    url = "https://api.github.com/gists/#{id}"

    if @accessToken
      url += "?access_token=#{@accessToken}"

    $.ajax
      url: url
      type: "PATCH"
      dataType: 'json'
      data: data
      success: callback

  create: (data, callback) ->
    url = "https://api.github.com/gists"

    if @accessToken
      url += "?access_token=#{@accessToken}"

    $.ajax
      url: url
      type: "POST"
      dataType: 'json'
      data: data
      success: callback

  get: (id, callback) ->
    if @accessToken
      data = access_token: @accessToken
    else
      data = {}

    $.getJSON "https://api.github.com/gists/#{id}", data, callback

  load: (id, {file, callback}) ->
    file ?= "build.js"

    @get id, (data) ->
      Function(data.files[file])()

      callback()
