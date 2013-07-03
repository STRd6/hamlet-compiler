fs = require('fs')
{parser} = require('./haml')
{lexer} = require('./build/lexer')
{renderJST, renderHaml} = require('./renderer')

parser.lexer = lexer

sampleDir = "test/samples/haml"

testFile = process.argv[2]

samples = {}
global.parser = parser

fs.readdirSync(sampleDir).forEach (file) ->
  data = fs.readFileSync "#{sampleDir}/#{file}", "UTF-8"

  samples[file] = data

exports.samples = samples
exports.parser = parser

runFile = (name) ->
  sample = samples["#{name}.haml"]
  result = parser.parse(sample)

  file = "results/#{name}.json"
  fs.writeFile(file, JSON.stringify(result, null, 2))
  console.log "Writing to file: #{file}"

  file = "results/#{name}.js"
  fs.writeFile(file, renderJST(result))
  console.log "Writing to file: #{file}"

  file = "results/#{name}.haml"
  fs.writeFile(file, renderHaml(result))
  console.log "Writing to file: #{file}"

if testFile
  runFile(testFile)
else
  Object.keys(samples).forEach (sample) ->
    name = sample.split(".")[0]

    runFile(name)

