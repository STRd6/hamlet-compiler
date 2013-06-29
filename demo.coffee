fs = require('fs')
{parser} = require('./haml')
{lexer} = require('./build/lexer')

lexer.options.backtrack_lexer = true

parser.lexer = lexer

sampleDir = "test/samples/haml"

samples = {}
global.parser = parser

fs.readdirSync(sampleDir).forEach (file) ->
  data = fs.readFileSync "#{sampleDir}/#{file}", "UTF-8"

  samples[file] = data

exports.samples = samples
exports.parser = parser

Object.keys(samples).forEach (sample) ->
  result = parser.parse(samples[sample])
  file = "results/#{sample}"
  fs.writeFile(file, JSON.stringify(result, null, 2))
  console.log "Writing to file: #{file}"
