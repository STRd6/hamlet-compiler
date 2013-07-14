module.exports =
  accessToken: null

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
