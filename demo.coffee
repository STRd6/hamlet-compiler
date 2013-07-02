fs = require('fs')
{parser} = require('./haml')
{lexer} = require('./build/lexer')
{render, renderHaml} = require('./renderer')

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
  name = sample.split(".")[0]

  file = "results/#{name}.json"
  fs.writeFile(file, JSON.stringify(result, null, 2))
  console.log "Writing to file: #{file}"

  file = "results/#{name}.html"
  fs.writeFile(file, render(result))
  console.log "Writing to file: #{file}"

  file = "results/#{name}.haml"
  fs.writeFile(file, renderHaml(result))
  console.log "Writing to file: #{file}"
