
linefeed = /\r?\n/
leadingWhitespace = /^[ \t]+/
indent = "  "

respace = (string) ->
  lines = string.split(linefeed)
  spacings = lines.map detectSpacing

  if first = compact(spacings)[0]
    # TODO: This will replace throughout the string and not just the
    # beginnings of lines
    string.replace RegExp(first, "g"), indent

detectSpacing = (line) ->
  line.match(leadingWhitespace)?[0]

compact = (array) ->
  array.filter (item) ->
    item?

module.exports = respace
